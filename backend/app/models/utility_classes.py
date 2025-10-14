from bson import ObjectId
from pydantic import BaseModel, Field, field_validator, field_serializer
from typing import Optional


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
    messages: list[dict] = Field(default=[])
    
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
    readBy: list[str] = Field(default=[])
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
    