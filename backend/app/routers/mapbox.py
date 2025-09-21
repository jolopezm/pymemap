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

# Diccionario de Bounding Boxes para regiones predefinidas.
# Formato: [min_longitude, min_latitude, max_longitude, max_latitude]
REGION_BOUNDING_BOXES = {
    "metropolitana": [-71.1, -34.3, -70.0, -32.9],
    # Puedes añadir más regiones aquí, ej: "valparaiso": [-72.0, -34.0, -70.3, -32.0]
}

@router.get("/geocoding/{search_text}")
async def get_geocoding_suggestions(
    search_text: str,
    country: str = Query("cl", description="Código de país para limitar la búsqueda, ej: 'cl' para Chile"),
    limit: int = Query(5, description="Número de resultados a devolver"),
    region: str = Query(None, description="Limita la búsqueda a una región predefinida (ej: 'metropolitana')"),
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

    # Si se especifica una región y la conocemos, añadimos el filtro de bounding box.
    if region and region.lower() in REGION_BOUNDING_BOXES:
        bbox = REGION_BOUNDING_BOXES[region.lower()]
        params["bbox"] = ",".join(map(str, bbox))

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
