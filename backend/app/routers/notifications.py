from fastapi import APIRouter, HTTPException, Query
from ..db import db
from app.models.utility_classes import Notification
from bson import ObjectId


router = APIRouter()

@router.post("/", response_model=Notification)
async def create_notification(notification: Notification):
    """Crea una nueva notificación"""
    notification_dict = notification.dict()
    result = await db.notifications.insert_one(notification_dict)
    db.notifications.create_index("expires_at", expireAfterSeconds=0)
    created_notification = await db.notifications.find_one({"_id": result.inserted_id})
    return Notification(**created_notification)

@router.get("/")
async def get_notifications_by_user(user_id: str = Query(...)):
    """Obtiene todas las notificaciones para un usuario específico"""
    notifications = []
    cursor = db.notifications.find({"targetUserId": user_id})
    async for document in cursor:
        notifications.append(Notification(**document))
    return notifications

@router.patch("/{notification_id}", response_model=Notification)
async def mark_notification_as_read(notification_id: str):
    """Marca una notificación como leída"""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=400, 
            detail="Invalid notification ID format"
        )
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    updated_notification = await db.notifications.find_one({"_id": ObjectId(notification_id)})
    return Notification(**updated_notification)