from typing import Optional, Any
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr, field_validator, field_serializer
from pydantic.config import ConfigDict

class User(BaseModel):
    rut: str = Field()
    name: str = Field()
    email: str = Field()
    password: str = Field()
    birthdate: str = Field()
    isAuthenticated: bool = Field(default=False)

class UserLogin(BaseModel):
    email: str = Field()
    password: str = Field()

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    rut: str = Field(...)
    name: str = Field(...)
    email: str = Field(...)
    birthdate: str = Field(...)
    
    # Pydantic v2 config
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    # Convert ObjectId to string before validation
    @field_validator('id', mode='before')
    @classmethod
    def _id_to_str(cls, v: Any) -> str:
        return str(v) if isinstance(v, ObjectId) else str(v)

    # Ensure JSON serialization of id is a string
    @field_serializer('id')
    def _serialize_id(self, v: str) -> str:
        return str(v)
        
class UserUpdate(BaseModel):
    rut: str | None = None
    name: str | None = None
    email: str | None = None
    birthdate: str | None = None

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str