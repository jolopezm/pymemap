"""
Script para geocodificar direcciones de negocios existentes en MongoDB.
Agrega coordenadas (latitude, longitude) a los negocios que no las tienen.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import os
from dotenv import load_dotenv
import time

# Cargar variables de entorno
load_dotenv()

# Configuración de MongoDB
MONGODB_URL = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "myDatabase")

# Crear geocoder
geolocator = Nominatim(user_agent="pymemap_geocoder")


async def geocode_address(address: str):
    """
    Geocodifica una dirección y retorna las coordenadas.
    """
    try:
        # Agregar "Chile" al final si no está incluido para mejorar precisión
        if "chile" not in address.lower():
            address_with_country = f"{address}, Chile"
        else:
            address_with_country = address
        
        print(f"  🔍 Geocodificando: {address_with_country}")
        location = geolocator.geocode(address_with_country, timeout=10)
        
        if location:
            print(f"  ✅ Coordenadas encontradas: ({location.latitude}, {location.longitude})")
            return {
                "latitude": location.latitude,
                "longitude": location.longitude
            }
        else:
            print(f"  ⚠️  No se encontraron coordenadas para: {address}")
            return None
            
    except GeocoderTimedOut:
        print(f"  ⏱️  Timeout geocodificando: {address}")
        return None
    except GeocoderServiceError as e:
        print(f"  ❌ Error del servicio de geocodificación: {e}")
        return None
    except Exception as e:
        print(f"  ❌ Error inesperado: {e}")
        return None


async def geocode_all_businesses():
    """
    Geocodifica todos los negocios en la base de datos que no tienen coordenadas.
    """
    # Conectar a MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    print(f"🔗 Conectado a MongoDB: {MONGODB_URL}/{DB_NAME}")
    print("=" * 80)
    
    try:
        # Buscar negocios sin coordenadas
        query = {
            "$or": [
                {"latitude": {"$exists": False}},
                {"longitude": {"$exists": False}},
                {"latitude": None},
                {"longitude": None}
            ]
        }
        
        businesses = await db.business.find(query).to_list(length=None)
        total = len(businesses)
        
        print(f"📊 Negocios sin coordenadas encontrados: {total}")
        print("=" * 80)
        
        if total == 0:
            print("✨ ¡Todos los negocios ya tienen coordenadas!")
            return
        
        updated = 0
        failed = 0
        
        for i, business in enumerate(businesses, 1):
            business_id = business.get("_id")
            name = business.get("name", "Sin nombre")
            address = business.get("address", "")
            
            print(f"\n[{i}/{total}] Procesando: {name}")
            print(f"  📍 Dirección: {address}")
            
            if not address:
                print(f"  ⚠️  Sin dirección, saltando...")
                failed += 1
                continue
            
            # Geocodificar
            coords = await geocode_address(address)
            
            if coords:
                # Actualizar en la base de datos
                result = await db.business.update_one(
                    {"_id": business_id},
                    {"$set": coords}
                )
                
                if result.modified_count > 0:
                    updated += 1
                    print(f"  💾 Actualizado en BD")
                else:
                    print(f"  ⚠️  No se pudo actualizar en BD")
                    failed += 1
            else:
                failed += 1
            
            # Esperar un poco entre peticiones para no saturar el servicio
            time.sleep(1)
        
        print("\n" + "=" * 80)
        print(f"✅ Proceso completado:")
        print(f"   - Negocios actualizados: {updated}")
        print(f"   - Fallidos: {failed}")
        print(f"   - Total procesados: {total}")
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Error fatal: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()
        print("\n🔌 Conexión cerrada")


if __name__ == "__main__":
    print("🌍 Iniciando geocodificación de negocios...")
    print("=" * 80)
    asyncio.run(geocode_all_businesses())
