from fastapi import APIRouter, HTTPException, Query
from ..db import db
from app.models.utility_classes import Chat, Message
from bson import ObjectId
from bson.errors import InvalidId
from app.services.chat import update_last_message
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def validate_object_id(id_str: str, field_name: str = "ID") -> ObjectId:
    """Valida y convierte un string a ObjectId de MongoDB"""
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError, ValueError) as e:
        logger.error(f"Invalid {field_name}: {id_str} - {str(e)}")
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid {field_name} format: {id_str}"
        )

@router.post("/", response_model=Chat)
async def create_chat(chat: Chat):
    """Crea un nuevo chat"""
    try:
        chat_dict = chat.dict()
        result = await db.chats.insert_one(chat_dict)
        created_chat = await db.chats.find_one({"_id": result.inserted_id})
        
        if not created_chat:
            raise HTTPException(status_code=500, detail="Error creating chat")
        
        return Chat(**created_chat)
    except Exception as e:
        logger.error(f"Error creating chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating chat: {str(e)}")

@router.get("/", response_model=list[Chat])
async def get_chats_by_user(user_id: str = Query(...)):
    """Obtiene todos los chats para un usuario específico con contador de mensajes no leídos"""
    try:
        if not user_id or user_id.strip() == "":
            raise HTTPException(status_code=400, detail="user_id is required")
        
        logger.info(f"📥 Fetching chats for user: {user_id}")
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
                # ✅ CORRECCIÓN: Convertir a dict
                last_message_obj = Message(**last_message_doc)
                document["last_message"] = last_message_obj.dict()
                document["last_message_at"] = last_message_doc.get("timestamp")
            else:
                document["last_message"] = None
                document["last_message_at"] = None
            
            chats.append(Chat(**document))
        
        logger.info(f"✅ Found {len(chats)} chats for user {user_id}")
        return chats
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching chats for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching chats: {str(e)}")

@router.get("/participants", response_model=Chat)
async def get_chat_by_participants(user1_id: str = Query(...), user2_id: str = Query(...)):
    """Obtiene un chat entre dos usuarios específicos"""
    try:
        if not user1_id or not user2_id:
            raise HTTPException(status_code=400, detail="Both user IDs are required")
        
        logger.info(f"🔍 Looking for chat between {user1_id} and {user2_id}")
        
        chat = await db.chats.find_one({
            "participants": {"$all": [user1_id, user2_id]}
        })
        
        if not chat:
            logger.info(f"❌ Chat not found between {user1_id} and {user2_id}")
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Agregar información de mensajes no leídos
        chat_id = str(chat["_id"])
        unread_count_user1 = await db.messages.count_documents({
            "chatId": chat_id,
            "read": False,
            "sender_id": {"$ne": user1_id}
        })
        
        chat["hasUnreadMessages"] = unread_count_user1 > 0
        chat["unreadMessageCount"] = unread_count_user1
        
        # Obtener último mensaje
        last_message_doc = await db.messages.find_one(
            {"chatId": chat_id},
            sort=[("timestamp", -1)]
        )
        
        if last_message_doc:
            # ✅ CORRECCIÓN: Convertir a dict
            last_message_obj = Message(**last_message_doc)
            chat["last_message"] = last_message_obj.dict()
            chat["last_message_at"] = last_message_doc.get("timestamp")
        
        logger.info(f"✅ Chat found: {chat_id}")
        return Chat(**chat)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error finding chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error finding chat: {str(e)}")

@router.post("/message", response_model=Message)
async def send_message(message: Message):
    """Envía un nuevo mensaje en un chat"""
    try:
        if not message.chatId:
            raise HTTPException(status_code=400, detail="chatId is required")
        if not message.sender_id:
            raise HTTPException(status_code=400, detail="sender_id is required")
        if not message.content or message.content.strip() == "":
            raise HTTPException(status_code=400, detail="content cannot be empty")
        
        logger.info(f"📤 Sending message in chat {message.chatId}")
        
        message_dict = message.dict()
        result = await db.messages.insert_one(message_dict)
        created_message = await db.messages.find_one({"_id": result.inserted_id})
        
        if not created_message:
            raise HTTPException(status_code=500, detail="Error creating message")
        
        # Actualizar último mensaje del chat
        await update_last_message(message.chatId, created_message)
        
        logger.info(f"✅ Message sent: {result.inserted_id}")
        return Message(**created_message)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

@router.get("/messages", response_model=list[Message])
async def get_messages_by_chat(chat_id: str = Query(...)):
    """Obtiene todos los mensajes para un chat específico"""
    try:
        if not chat_id:
            raise HTTPException(status_code=400, detail="chat_id is required")
        
        logger.info(f"📥 Fetching messages for chat: {chat_id}")
        
        messages = []
        cursor = db.messages.find({"chatId": chat_id}).sort("timestamp", 1)
        
        async for document in cursor:
            messages.append(Message(**document))
        
        logger.info(f"✅ Found {len(messages)} messages for chat {chat_id}")
        return messages
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching messages for chat {chat_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")

@router.put("/message/{message_id}/edit", response_model=Message)
async def edit_message(message_id: str, message: Message):
    """Edita un mensaje existente"""
    try:
        # Validar ObjectId
        obj_id = validate_object_id(message_id, "message_id")
        
        logger.info(f"✏️ Editing message: {message_id}")
        
        message_dict = message.dict()
        result = await db.messages.update_one(
            {"_id": obj_id}, 
            {"$set": message_dict}
        )
        
        if result.modified_count == 0:
            # Verificar si existe
            existing = await db.messages.find_one({"_id": obj_id})
            if not existing:
                raise HTTPException(status_code=404, detail="Message not found")
            # Si existe pero no se modificó, es porque los datos son iguales
            logger.info(f"⚠️ Message {message_id} not modified (same data)")
        
        updated_message = await db.messages.find_one({"_id": obj_id})
        
        logger.info(f"✅ Message edited: {message_id}")
        return Message(**updated_message)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error editing message {message_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error editing message: {str(e)}")

@router.put("/chat/{chat_id}/mark-as-read")
async def mark_chat_messages_as_read(chat_id: str, user_id: str = Query(...)):
    """Marca todos los mensajes de un chat como leídos para un usuario específico"""
    try:
        # Validaciones
        if not chat_id:
            raise HTTPException(status_code=400, detail="chat_id is required")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        
        logger.info(f"📖 Marking messages as read - Chat: {chat_id}, User: {user_id}")
        
        # Verificar que el chat existe
        chat_obj_id = validate_object_id(chat_id, "chat_id")
        chat_exists = await db.chats.find_one({"_id": chat_obj_id})
        
        if not chat_exists:
            logger.warning(f"⚠️ Chat {chat_id} not found")
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Verificar que el usuario es participante del chat
        if user_id not in chat_exists.get("participants", []):
            logger.warning(f"⚠️ User {user_id} is not a participant of chat {chat_id}")
            raise HTTPException(
                status_code=403, 
                detail="User is not a participant of this chat"
            )
        
        # Actualizar todos los mensajes no leídos del chat que NO fueron enviados por el usuario
        update_result = await db.messages.update_many(
            {
                "chatId": chat_id,
                "read": False,
                "sender_id": {"$ne": user_id}
            },
            {"$set": {"read": True}}
        )
        
        logger.info(f"✅ Marked {update_result.modified_count} messages as read")
        
        # Actualizar el contador de mensajes no leídos en el chat
        unread_count = await db.messages.count_documents({
            "chatId": chat_id,
            "read": False,
            "sender_id": {"$ne": user_id}
        })
        
        await db.chats.update_one(
            {"_id": chat_obj_id},
            {
                "$set": {
                    "hasUnreadMessages": unread_count > 0,
                    "unreadMessageCount": unread_count
                }
            }
        )
        
        logger.info(f"✅ Chat {chat_id} updated - Unread count: {unread_count}")
        
        return {
            "message": "Messages marked as read successfully",
            "modified_count": update_result.modified_count,
            "unread_count": unread_count,
            "chat_id": chat_id,
            "user_id": user_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error marking chat as read - Chat: {chat_id}, User: {user_id}, Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error marking messages as read: {str(e)}"
        )