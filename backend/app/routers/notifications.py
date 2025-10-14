from fastapi import APIRouter, HTTPException, Query
from ..db import db
from app.models.utility_classes import Notification

router = APIRouter()

@router.post("/", response_model=Notification)
async def create_notification(notification: Notification):
    """Crea una nueva notificación"""
    notification_dict = notification.dict()
    result = await db.notifications.insert_one(notification_dict)
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