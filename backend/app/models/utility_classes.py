from bson import ObjectId
from pydantic import BaseModel, Field, field_validator, field_serializer
from typing import Optional
from datetime import datetime, timedelta


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    @classmethod
    def validate(cls, v, field=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler=None):
        return {'type': 'string'}


class Notification(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    targetUserId: str = Field(...)
    type: str = Field(...)
    message: str = Field(...)
    date: str = Field(...)
    read: bool = Field(default=False)
    reference: Optional[dict] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=datetime.utcnow() + timedelta(days=7))

    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_schema_extra": {"by_alias": True}
    }

    @field_validator('targetUserId', mode='before')
    @classmethod
    def _id_to_str(cls, v):
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_validator('id', mode='before')
    @classmethod
    def _id_field_to_str(cls, v):
        """Convert MongoDB ObjectId in the incoming `_id` field to a string so
        Pydantic accepts it as `id: Optional[str]`.
        """
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_serializer('id', check_fields=False)
    def _serialize_id(self, v):
        return str(v) if v is not None else None
    
class Chat(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    participants: list[str] = Field(...)
    last_message: Optional[str | dict] = Field(default=None) 
    last_message_at: Optional[datetime] = Field(default=None)
    hasUnreadMessages: Optional[bool] = Field(default=False)
    unreadMessageCount: Optional[int] = Field(default=0)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_schema_extra": {"by_alias": True}
    }

    @field_validator('participants', mode='before')
    @classmethod
    def _participants_to_str(cls, v):
        if not isinstance(v, list):
            raise ValueError("Participants must be a list")
        return [str(part) if isinstance(part, ObjectId) else str(part) for part in v]
    
    @field_validator('last_message', mode='before')
    @classmethod
    def _last_message_serialize(cls, v):
        """Convert any ObjectId in last_message dict to string, or accept string directly"""
        if v is None:
            return None
        if isinstance(v, str):
            # If it's already a string, return it as is
            return v
        if isinstance(v, dict):
            # Recursively convert any ObjectId to string
            return {
                key: str(val) if isinstance(val, ObjectId) else val
                for key, val in v.items()
            }
        return v

    @field_validator('id', mode='before')
    @classmethod
    def _id_field_to_str(cls, v):
        """Convert MongoDB ObjectId in the incoming `_id` field to a string so
        Pydantic accepts it as `id: Optional[str]`.
        """
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_serializer('id', check_fields=False)
    def _serialize_id(self, v):
        return str(v) if v is not None else None
    
class Message(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    chatId: str = Field(...)
    sender_id: str = Field(...)
    content: str = Field(...)
    read: bool = Field(default=False)
    timestamp: str = Field(...)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_schema_extra": {"by_alias": True}
    }
    @field_validator('chatId', mode='before')
    @classmethod
    def _chat_id_to_str(cls, v):
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_validator('sender_id', mode='before')
    @classmethod
    def _sender_id_to_str(cls, v):
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_validator('id', mode='before')
    @classmethod
    def _id_field_to_str(cls, v):
        """Convert MongoDB ObjectId in the incoming `_id` field to a string so
        Pydantic accepts it as `id: Optional[str]`.
        """
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_serializer('id', check_fields=False)
    def _serialize_id(self, v):
        return str(v) if v is not None else None
    

class Review(BaseModel):
    businessId: str = Field(...)
    userId: str = Field(...)
    userName: str = Field(...)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(...)
    date: str = Field(...)
    bookingId: Optional[str] = Field(default=None, description="ID de la reserva asociada")
    source: Optional[str] = Field(default=None, description="Origen de la reseña (booking, direct, etc.)")
    
    @field_validator('businessId', mode='before')
    @classmethod
    def _business_id_to_str(cls, v):
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_validator('userId', mode='before')
    @classmethod
    def _user_id_to_str(cls, v):
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)