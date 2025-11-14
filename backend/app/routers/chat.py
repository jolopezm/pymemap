from fastapi import APIRouter, HTTPException, Query
from ..db import db
from app.models.utility_classes import Chat, Message
from bson import ObjectId
from app.services.chat import update_last_message

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
    """Obtiene todos los chats para un usuario específico con contador de mensajes no leídos"""
    chats = []
    cursor = db.chats.find({"participants": user_id})
    async for document in cursor:
        chat_id = str(document["_id"])
        
        # Contar mensajes no leídos para este usuario (mensajes que no envió él)
        unread_count = await db.messages.count_documents({
            "chatId": chat_id,
            "read": False,
            "sender_id": {"$ne": user_id}
        })
        
        # Obtener el último mensaje
        last_message_doc = await db.messages.find_one(
            {"chatId": chat_id},
            sort=[("timestamp", -1)]
        )
        
        # Agregar campos calculados al documento
        document["hasUnreadMessages"] = unread_count > 0
        document["unreadMessageCount"] = unread_count
        
        if last_message_doc:
            document["last_message"] = last_message_doc.get("content", "")
            document["last_message_at"] = last_message_doc.get("timestamp")
        
        chats.append(Chat(**document))
    
    return chats

@router.get("/participants", response_model=Chat)
async def get_chat_by_participants(user1_id: str = Query(...), user2_id: str = Query(...)):
    """Obtiene un chat entre dos usuarios específicos"""
    chat = await db.chats.find_one({"participants": {"$all": [user1_id, user2_id]}})
    if chat:
        return Chat(**chat)
    else:
        raise HTTPException(status_code=404, detail="Chat not found")

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

@router.put("/chat/{chat_id}/mark-as-read")
async def mark_chat_messages_as_read(chat_id: str, user_id: str = Query(...)):
    """Marca todos los mensajes de un chat como leídos para un usuario específico"""
    # Actualizar todos los mensajes no leídos del chat que NO fueron enviados por el usuario
    result = await db.messages.update_many(
        {
            "chatId": chat_id,
            "read": False,
            "sender_id": {"$ne": user_id}  # Solo marcar como leídos los mensajes del otro usuario
        },
        {"$set": {"read": True}}
    )
    
    # Actualizar el contador de mensajes no leídos en el chat
    unread_count = await db.messages.count_documents({
        "chatId": chat_id,
        "read": False,
        "sender_id": {"$ne": user_id}
    })
    
    await db.chats.update_one(
        {"_id": ObjectId(chat_id)},
        {
            "$set": {
                "hasUnreadMessages": unread_count > 0,
                "unreadMessageCount": unread_count
            }
        }
    )
    
    return {
        "message": "Messages marked as read",
        "modified_count": result.modified_count,
        "unread_count": unread_count
    }