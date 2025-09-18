from pydantic import BaseModel, Field
from .utility_classes import PyObjectId
from bson import ObjectId

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
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    rut: str = Field(...)
    name: str = Field(...)
    email: str = Field(...)
    birthdate: str = Field(...)

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        
class UserUpdate(BaseModel):
    rut: str | None = None
    name: str | None = None
    email: str | None = None
    birthdate: str | None = None