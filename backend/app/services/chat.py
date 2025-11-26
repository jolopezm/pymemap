from fastapi import HTTPException
from app.models.utility_classes import Chat
from bson import ObjectId
from datetime import datetime
from ..db import db

async def update_last_message(chat_id: str, last_message: dict):
    """Actualiza el último mensaje y la marca de tiempo en un chat"""
    result = await db.chats.update_one(
        {"_id": ObjectId(chat_id)},
        {
            "$set": {
                "last_message": last_message,
                "last_message_at": last_message.get("timestamp")
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    updated_chat = await db.chats.find_one({"_id": ObjectId(chat_id)})
    return Chat(**updated_chat)