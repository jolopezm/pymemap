from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timedelta
from typing import List
from bson import ObjectId
from ..db import db
from ..models.sellers import (
    BusinessAvailability, 
    BookingRequest, 
    BookingResponse,
    TimeSlot
)
from ..auth import get_current_user
from ..models.token import TokenData

router = APIRouter()

async def get_user_id_from_token(current_user: TokenData) -> str:
    """Helper para obtener el user_id desde el token"""
    user = await db.users.find_one({"email": current_user.email})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return str(user.get("_id", ""))

@router.post("/business/{business_id}/availability")
async def set_business_availability(
    business_id: str,
    availability: BusinessAvailability,
    current_user: TokenData = Depends(get_current_user)
):
    """Dueño de negocio configura disponibilidad para una fecha"""
    # Obtener el user_id
    user_id = await get_user_id_from_token(current_user)
    
    # Verificar que el usuario sea dueño del negocio
    try:
        business = await db.business.find_one({"_id": ObjectId(business_id)})
    except Exception as e:
        print(f"❌ Error buscando negocio: {e}")
        business = await db.business.find_one({"_id": business_id})
    
    if not business:
        print(f"❌ Negocio no encontrado: {business_id}")
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    
    # Comparar IDs como strings
    owner_id = str(business.get("owner_id", ""))
    
    print(f"🔍 Verificando autorización:")
    print(f"   Business ID: {business_id}")
    print(f"   Owner ID: {owner_id}")
    print(f"   User ID: {user_id}")
    print(f"   Match: {owner_id == user_id}")
    
    if owner_id != user_id:
        raise HTTPException(
            status_code=403, 
            detail=f"No autorizado. El negocio pertenece a otro usuario."
        )
    
    # Guardar o actualizar disponibilidad
    await db.availability.update_one(
        {"business_id": business_id, "date": availability.date},
        {"$set": availability.dict()},
        upsert=True
    )
    print(f"✅ Disponibilidad guardada para {business_id} en {availability.date}")
    return {"message": "Disponibilidad actualizada"}

@router.get("/business/{business_id}/availability/{year}/{month}")
async def get_business_availability(
    business_id: str,
    year: int,
    month: int
):
    """Obtener días disponibles de un mes"""
    start_date = f"{year}-{month:02d}-01"
    # Calcular último día del mes
    if month == 12:
        end_date = f"{year+1}-01-01"
    else:
        end_date = f"{year}-{month+1:02d}-01"
    
    cursor = db.availability.find({
        "business_id": business_id,
        "date": {"$gte": start_date, "$lt": end_date}
    })
    
    available_days = []
    async for doc in cursor:
        # Convertir ObjectId a string
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        available_days.append(doc)
    
    return available_days

@router.get("/business/{business_id}/availability/date/{date}/slots")
async def get_available_slots(business_id: str, date: str):
    """Obtener horarios disponibles para una fecha específica"""
    availability = await db.availability.find_one({
        "business_id": business_id,
        "date": date
    })
    
    if not availability:
        raise HTTPException(status_code=404, detail="No hay disponibilidad para esta fecha")
    
    # Obtener reservas existentes para el día
    bookings = []
    cursor = db.bookings.find({
        "business_id": business_id,
        "date": date,
        "status": {"$in": ["pending", "confirmed"]}
    })
    async for booking in cursor:
        bookings.append(booking)
    
    # Marcar slots ocupados
    slots = availability["time_slots"]
    for slot in slots:
        # Verificar si hay reservas que se solapen
        overlapping = any(
            booking["start_time"] < slot["end_time"] and 
            booking["end_time"] > slot["start_time"]
            for booking in bookings
        )
        slot["is_available"] = not overlapping
    
    return slots

@router.post("/")
async def create_booking(
    booking: BookingRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """Cliente crea solicitud de reserva"""
    # Obtener el user_id
    user_id = await get_user_id_from_token(current_user)
    
    # Verificar disponibilidad
    availability = await db.availability.find_one({
        "business_id": booking.business_id,
        "date": booking.date
    })
    
    if not availability:
        raise HTTPException(status_code=400, detail="Fecha no disponible")
    
    # Verificar que el slot esté libre
    overlapping_booking = await db.bookings.find_one({
        "business_id": booking.business_id,
        "date": booking.date,
        "status": {"$in": ["pending", "confirmed"]},
        "start_time": {"$lt": booking.end_time},
        "end_time": {"$gt": booking.start_time}
    })
    
    if overlapping_booking:
        raise HTTPException(status_code=400, detail="Horario no disponible")
    
    booking_dict = booking.dict()
    booking_dict["client_id"] = user_id
    booking_dict["created_at"] = datetime.now()
    
    result = await db.bookings.insert_one(booking_dict)
    created_booking = await db.bookings.find_one({"_id": result.inserted_id})
    
    # Convertir ObjectId a string
    if created_booking:
        created_booking["_id"] = str(created_booking["_id"])
    
    # TODO: Enviar notificación al dueño del negocio
    
    return created_booking

@router.patch("/{booking_id}/confirm")
async def confirm_booking(
    booking_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Dueño de negocio confirma reserva"""
    booking = await db.bookings.find_one({"_id": booking_id})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    # Verificar que el usuario sea dueño del negocio
    user_id = await get_user_id_from_token(current_user)
    
    try:
        business = await db.business.find_one({"_id": ObjectId(booking["business_id"])})
    except Exception:
        business = await db.business.find_one({"_id": booking["business_id"]})
    
    if not business:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    
    # Comparar IDs como strings
    owner_id = str(business.get("owner_id", ""))
    
    if owner_id != user_id:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    await db.bookings.update_one(
        {"_id": booking_id},
        {"$set": {"status": "confirmed"}}
    )
    
    # TODO: Enviar notificación al cliente
    
    return {"message": "Reserva confirmada"}

@router.get("/my-bookings")
async def get_my_bookings(current_user: TokenData = Depends(get_current_user)):
    """Obtener reservas del usuario actual"""
    user_id = await get_user_id_from_token(current_user)
    
    cursor = db.bookings.find({"client_id": user_id})
    bookings = []
    async for booking in cursor:
        booking["_id"] = str(booking["_id"])
        bookings.append(booking)
    return bookings

@router.get("/business/{business_id}/bookings")
async def get_business_bookings(
    business_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Obtener reservas de un negocio (solo dueño)"""
    user_id = await get_user_id_from_token(current_user)
    
    try:
        business = await db.business.find_one({"_id": ObjectId(business_id)})
    except Exception:
        business = await db.business.find_one({"_id": business_id})
    
    if not business:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    
    # Comparar IDs como strings
    owner_id = str(business.get("owner_id", ""))
    
    if owner_id != user_id:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    cursor = db.bookings.find({"business_id": business_id})
    bookings = []
    async for booking in cursor:
        booking["_id"] = str(booking["_id"])
        bookings.append(booking)
    return bookings