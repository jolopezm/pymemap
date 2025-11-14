"""
Servicio de geocodificación para convertir direcciones en coordenadas.
"""

from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import asyncio

# Crear geocoder
geolocator = Nominatim(user_agent="pymemap_app")


async def geocode_address_async(address: str, country: str = "Chile"):
    """
    Geocodifica una dirección de forma asíncrona.
    
    Args:
        address: La dirección a geocodificar
        country: País para mejorar precisión (default: Chile)
    
    Returns:
        Dict con latitude y longitude, o None si falla
    """
    try:
        # Agregar país si no está incluido
        if country.lower() not in address.lower():
            full_address = f"{address}, {country}"
        else:
            full_address = address
        
        # Ejecutar geocodificación en thread pool (geopy es síncrono)
        loop = asyncio.get_event_loop()
        location = await loop.run_in_executor(
            None, 
            lambda: geolocator.geocode(full_address, timeout=10)
        )
        
        if location:
            return {
                "latitude": location.latitude,
                "longitude": location.longitude
            }
        
        return None
        
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"Error geocodificando '{address}': {e}")
        return None
    except Exception as e:
        print(f"Error inesperado geocodificando '{address}': {e}")
        return None


def geocode_address_sync(address: str, country: str = "Chile"):
    """
    Geocodifica una dirección de forma síncrona.
    
    Args:
        address: La dirección a geocodificar
        country: País para mejorar precisión (default: Chile)
    
    Returns:
        Dict con latitude y longitude, o None si falla
    """
    try:
        # Agregar país si no está incluido
        if country.lower() not in address.lower():
            full_address = f"{address}, {country}"
        else:
            full_address = address
        
        location = geolocator.geocode(full_address, timeout=10)
        
        if location:
            return {
                "latitude": location.latitude,
                "longitude": location.longitude
            }
        
        return None
        
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"Error geocodificando '{address}': {e}")
        return None
    except Exception as e:
        print(f"Error inesperado geocodificando '{address}': {e}")
        return None
