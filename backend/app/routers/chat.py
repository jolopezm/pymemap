from fastapi import APIRouter, HTTPException, Query
from ..db import db
from app.models.utility_classes import Chat, Message
from bson import ObjectId
from services.chat import update_last_message

router = APIRouter()

@router.post("/", response_model=Chat)
async def create_chat(chat: Chat):
    """Crea un nuevo chat"""
    chat_dict = chat.dict()
    result = await db.chats.insert_one(chat_dict)
    created_chat = await db.chats.find_one({"_id": result.inserted_id})
    return Chat(**created_chat)

@router.get("/", response_model=list[Chat])
async def get_chats_by_user(user_id: str = Query(...)):
    """Obtiene todos los chats para un usuario específico"""
    chats = []
    cursor = db.chats.find({"participants": user_id})
    async for document in cursor:
        chats.append(Chat(**document))
    return chats

@router.post("/message", response_model=Message)
async def send_message(message: Message):
    """Envía un nuevo mensaje en un chat"""
    message_dict = message.dict()
    result = await db.messages.insert_one(message_dict)
    created_message = await db.messages.find_one({"_id": result.inserted_id})
    await update_last_message(message.chatId, created_message)
    return Message(**created_message)

@router.get("/messages", response_model=list[Message])
async def get_messages_by_chat(chat_id: str = Query(...)):
    """Obtiene todos los mensajes para un chat específico"""
    messages = []
    cursor = db.messages.find({"chatId": chat_id}).sort("timestamp", 1)
    async for document in cursor:
        messages.append(Message(**document))
    return messages

@router.put("/message/{message_id}/edit", response_model=Message)
async def edit_message(message_id: str, message: Message):
    """Edita un mensaje existente"""
    message_dict = message.dict()
    result = await db.messages.update_one({"_id": ObjectId(message_id)}, {"$set": message_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    updated_message = await db.messages.find_one({"_id": ObjectId(message_id)})
    return Message(**updated_message)