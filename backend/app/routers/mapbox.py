import httpx
import os
from fastapi import APIRouter, HTTPException, Query
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(
    prefix="/mapbox",
    tags=["mapbox"],
    responses={404: {"description": "Not found"}},
)

MAPBOX_ACCESS_TOKEN = os.getenv("MAPBOX_ACCESS_TOKEN")
MAPBOX_API_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places"

@router.get("/geocoding/{search_text}")
async def get_geocoding_suggestions(
    search_text: str,
    country: str = Query("cl", description="Código de país para limitar la búsqueda, ej: 'cl' para Chile"),
    limit: int = Query(5, description="Número de resultados a devolver"),
):
    """
    Obtiene sugerencias de geocodificación desde la API de Mapbox.
    Ideal para autocompletar formularios de dirección.
    """
    if not MAPBOX_ACCESS_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="El token de acceso de Mapbox no está configurado en el servidor.",
        )

    params = {
        "access_token": MAPBOX_ACCESS_TOKEN,
        "country": country,
        "limit": limit,
        "autocomplete": "true", # Esencial para obtener sugerencias mientras se escribe
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{MAPBOX_API_URL}/{search_text}.json", params=params)
            response.raise_for_status()  # Lanza una excepción para errores 4xx o 5xx
            return response.json()
        except httpx.HTTPStatusError as e:
            # Reenvía el error desde la API de Mapbox
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error desde la API de Mapbox: {e.response.text}",
            )
        except httpx.RequestError:
            # Para errores de red
            raise HTTPException(
                status_code=503,
                detail="Servicio no disponible: No se pudo conectar a la API de Mapbox.",
            )
