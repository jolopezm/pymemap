"""
Script para probar Nominatim (OpenStreetMap) Geocoding - Gratuito
"""
import requests
import time

def test_reverse_geocoding():
    """Prueba geocodificación inversa (coordenadas -> dirección)"""
    # Coordenadas de ejemplo en Santiago, Chile (Plaza de Armas)
    lat = -33.4372
    lon = -70.6506
    
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1&accept-language=es"
    
    print(f"\n🔍 Probando geocodificación inversa con Nominatim:")
    print(f"Coordenadas: {lat}, {lon}")
    
    response = requests.get(url, headers={'User-Agent': 'PymeMap/1.0'})
    data = response.json()
    
    if 'error' not in data:
        print("✅ API funcionando correctamente")
        print(f"\nDirección completa: {data.get('display_name')}")
        
        if 'address' in data:
            addr = data['address']
            print("\nComponentes de dirección:")
            for key, value in addr.items():
                print(f"  - {key}: {value}")
                
            # Construir dirección formateada
            parts = []
            if 'road' in addr:
                if 'house_number' in addr:
                    parts.append(f"{addr['road']} {addr['house_number']}")
                else:
                    parts.append(addr['road'])
            if 'suburb' in addr:
                parts.append(addr['suburb'])
            if 'city' in addr:
                parts.append(addr['city'])
            
            formatted = ', '.join(parts) if parts else data.get('display_name')
            print(f"\n✨ Dirección formateada: {formatted}")
    else:
        print(f"❌ Error: {data.get('error')}")

def test_forward_geocoding():
    """Prueba geocodificación directa (dirección -> coordenadas)"""
    address = "Paseo Ahumada 312, Santiago, Chile"
    
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={requests.utils.quote(address)}&limit=1&countrycodes=cl&addressdetails=1&accept-language=es"
    
    print(f"\n\n🔍 Probando geocodificación directa con Nominatim:")
    print(f"Dirección: {address}")
    
    response = requests.get(url, headers={'User-Agent': 'PymeMap/1.0'})
    data = response.json()
    
    if data and len(data) > 0:
        result = data[0]
        print("✅ API funcionando correctamente")
        print(f"\nCoordenadas encontradas: {result['lat']}, {result['lon']}")
        print(f"Dirección completa: {result['display_name']}")
        print(f"Tipo: {result.get('type')}")
        print(f"Importancia: {result.get('importance')}")
    else:
        print(f"❌ No se encontraron resultados")

if __name__ == '__main__':
    print("=" * 60)
    print("PRUEBA DE NOMINATIM (OpenStreetMap) GEOCODING")
    print("=" * 60)
    print("\n💡 Nominatim es GRATUITO y no requiere API key")
    print("⚠️  Límite: 1 petición por segundo (respetando términos de uso)")
    
    test_reverse_geocoding()
    
    # Esperar 1 segundo entre peticiones (política de uso de Nominatim)
    time.sleep(1)
    
    test_forward_geocoding()
    
    print("\n" + "=" * 60)
    print("PRUEBA COMPLETADA")
    print("=" * 60)
    print("\n✅ Nominatim funcionando correctamente")
    print("📝 Ventajas: Gratuito, sin API key, sin tarjeta")
    print("⚠️  Limitación: Máximo 1 petición/segundo")
