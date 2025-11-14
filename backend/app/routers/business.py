from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, UploadFile, File
from ..db import db
from ..models.sellers import Business, Service
from ..services.upload_images_to_gcp import upload_profile_picture as upload_to_gcp
from ..services.geocoding import geocode_address_async

router = APIRouter()

@router.get("/", response_model=list[Business])
async def get_business():
    business = []
    cursor = db.business.find({})
    async for document in cursor:
        business.append(Business(**document))
    return business

@router.post("/", response_model=Business)
async def create_business(business: Business):
    """Crea un nuevo negocio y geocodifica su dirección automáticamente"""
    existing_business = await db.business.find_one({"name": business.name})
    if existing_business:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name already registered"
        )
        
    business_dict = business.dict()
    
    # Geocodificar dirección si no tiene coordenadas
    if (not business_dict.get("latitude") or not business_dict.get("longitude")) and business_dict.get("address"):
        print(f"📍 Geocodificando dirección: {business_dict['address']}")
        coords = await geocode_address_async(business_dict["address"])
        if coords:
            business_dict.update(coords)
            print(f"✅ Coordenadas obtenidas: {coords}")
        else:
            print(f"⚠️ No se pudieron obtener coordenadas")
    
    await db.business.insert_one(business_dict)
    created_business = await db.business.find_one({"name": business.name})
    return Business(**created_business)

@router.post("/request-service", response_model=Service)
async def request_service(service: Service):
    """Solicita un nuevo servicio"""
    service_dict = service.dict()
    result = await db.services.insert_one(service_dict)
    created_service = await db.services.find_one({"_id": result.inserted_id})
    return Service(**created_service)

@router.get("/services", response_model=list[Service])
async def get_services():
    services = []
    cursor = db.services.find({})
    async for document in cursor:
        services.append(Service(**document))
    return services

@router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: str):
    """Elimina un servicio por su ID"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(
            status_code=400, 
            detail="Invalid service ID format"
        )
    result = await db.services.delete_one({"_id": ObjectId(service_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return None

@router.patch("/services/{service_id}/status", response_model=Service)
async def update_service_status(service_id: str, status_data: dict):
    """Actualiza el estado de un servicio"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(
            status_code=400, 
            detail="Invalid service ID format"
        )
    
    new_status = status_data.get("state")
    if not new_status:
        raise HTTPException(
            status_code=400,
            detail="State field is required"
        )
    
    result = await db.services.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": {"state": new_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    updated_service = await db.services.find_one({"_id": ObjectId(service_id)})
    return Service(**updated_service)


@router.patch("/services/{service_id}/request-payment", response_model=Service)
async def request_payment(service_id: str, payment_data: dict):
    """Vendedor solicita cobrar un precio al cliente"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid service ID format"
        )

    requested_price = payment_data.get("requested_price")
    if requested_price is None:
        raise HTTPException(status_code=400, detail="requested_price is required")

    result = await db.services.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": {"requested_price": requested_price, "state": "payment_requested"}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")

    updated_service = await db.services.find_one({"_id": ObjectId(service_id)})
    return Service(**updated_service)


@router.post("/services/{service_id}/pay", response_model=Service)
async def pay_service(service_id: str):
    """Cliente paga el servicio solicitado, se marca como completed"""
    if not ObjectId.is_valid(service_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid service ID format"
        )

    from datetime import datetime

    paid_at = datetime.utcnow().isoformat()

    result = await db.services.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": {"state": "completed", "paid_at": paid_at}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")

    updated_service = await db.services.find_one({"_id": ObjectId(service_id)})
    return Service(**updated_service)


@router.post("/upload-pictures/{business_id}", response_model=Business)
async def upload_pictures(business_id: str, file: UploadFile = File(...)):
    """Sube una nueva foto de perfil para el negocio"""

    business_id = business_id.strip()
    print(f"🔍 Recibiendo upload para business_id: '{business_id}' (longitud: {len(business_id)})")
    print(f"📎 Archivo: {file.filename}, Content-Type: {file.content_type}")

    if not ObjectId.is_valid(business_id):
        raise HTTPException(
            status_code=400,
            detail=f"Formato de ID de negocio inválido: {business_id}"
        )

    # Usar db.business (singular) como en todos los demás endpoints
    business = await db.business.find_one({"_id": ObjectId(business_id)})
    if not business:
        raise HTTPException(
            status_code=404, 
            detail=f"Negocio no encontrado con ID: {business_id}"
        )
    
    try:
        # Subir imagen a GCP
        image_url = upload_to_gcp(file, bucket_name="pymap_businesses_pics")
        print(f"✅ Imagen subida exitosamente: {image_url}")
        
        # Actualizar el negocio con la nueva URL
        await db.business.update_one(
            {"_id": ObjectId(business_id)},
            {"$set": {"profile_pic": image_url}}
        )
        
        updated_business = await db.business.find_one({"_id": ObjectId(business_id)})
        return Business(**updated_business)
        
    except Exception as e:
        print(f"❌ Error al subir imagen: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error al subir la imagen: {str(e)}"
        )


@router.patch("/{business_id}", response_model=Business)
async def update_business(business_id: str, update_data: dict):
    """Actualiza un negocio. Si cambia la dirección, geocodifica automáticamente."""
    if not ObjectId.is_valid(business_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid business ID format"
        )
    
    # Verificar que el negocio existe
    existing = await db.business.find_one({"_id": ObjectId(business_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Si se actualiza la dirección, geocodificar automáticamente
    if "address" in update_data and update_data["address"]:
        # Solo geocodificar si la dirección cambió
        if update_data["address"] != existing.get("address"):
            print(f"📍 Dirección actualizada, geocodificando: {update_data['address']}")
            coords = await geocode_address_async(update_data["address"])
            if coords:
                update_data.update(coords)
                print(f"✅ Nuevas coordenadas: {coords}")
    
    # Actualizar
    result = await db.business.update_one(
        {"_id": ObjectId(business_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    
    updated_business = await db.business.find_one({"_id": ObjectId(business_id)})
    return Business(**updated_business)


@router.patch("/{business_id}/location", response_model=Business)
async def update_business_location(business_id: str, location_data: dict):
    """Actualiza manualmente las coordenadas de ubicación de un negocio"""
    if not ObjectId.is_valid(business_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid business ID format"
        )
    
    latitude = location_data.get("latitude")
    longitude = location_data.get("longitude")
    
    if latitude is None or longitude is None:
        raise HTTPException(
            status_code=400,
            detail="latitude and longitude are required"
        )
    
    result = await db.business.update_one(
        {"_id": ObjectId(business_id)},
        {"$set": {"latitude": latitude, "longitude": longitude}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    
    updated_business = await db.business.find_one({"_id": ObjectId(business_id)})
    return Business(**updated_business)


@router.get("/nearby", response_model=list[Business])
async def get_nearby_businesses(latitude: float, longitude: float, radius_km: float = 10):
    """
    Obtiene negocios cercanos a unas coordenadas específicas.
    
    Args:
        latitude: Latitud del punto de referencia
        longitude: Longitud del punto de referencia
        radius_km: Radio de búsqueda en kilómetros (default: 10km)
    """
    import math
    
    # Convertir el radio de km a grados (aproximado)
    # 1 grado de latitud ≈ 111 km
    # 1 grado de longitud varía según la latitud
    lat_range = radius_km / 111.0
    lon_range = radius_km / (111.0 * math.cos(math.radians(latitude)))
    
    # Buscar negocios dentro del rango
    query = {
        "latitude": {
            "$gte": latitude - lat_range,
            "$lte": latitude + lat_range
        },
        "longitude": {
            "$gte": longitude - lon_range,
            "$lte": longitude + lon_range
        }
    }
    
    businesses = []
    cursor = db.business.find(query)
    async for document in cursor:
        businesses.append(Business(**document))
    
    return businesses