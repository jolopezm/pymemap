import httpx
import os
from fastapi import APIRouter, HTTPException, Query
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GOOGLE_AUTOCOMPLETE_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json"

@router.get("/autocomplete/{search_text}")
async def autocomplete(search_text: str, country: str = Query(None, min_length=2, max_length=2)):
    params = {
        "input": search_text,
        "key": GOOGLE_MAPS_API_KEY,
    }
    if country:
        params["components"] = f"country:{country}"

    async with httpx.AsyncClient() as client:
        response = await client.get(GOOGLE_AUTOCOMPLETE_URL, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Error fetching data from Google Maps API")
        data = response.json()
        if data.get("status") != "OK":
            raise HTTPException(status_code=400, detail=f"Google Maps API error: {data.get('status')}")
        return data.get("predictions", [])
    