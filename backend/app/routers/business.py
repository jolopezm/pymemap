from fastapi import APIRouter, HTTPException, status
from ..db import db
from ..models.sellers import Business, Service

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
    """Crea un nuevo negocio"""
    existing_business = await db.business.find_one({"name": business.name})
    if existing_business:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name already registered"
        )
        
    business_dict = business.dict()
    
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