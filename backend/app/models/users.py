from typing import Optional, Any
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr, field_validator, field_serializer
from pydantic.config import ConfigDict
from ..utils.password_validator import PasswordValidation
from datetime import datetime

class User(BaseModel):
    rut: str = Field()
    name: str = Field()
    email: str = Field()
    password: str = Field()
    birthdate: str = Field()
    isAuthenticated: bool = Field(default=False)
    balance: float = Field(default=0.0)
    profile_pic: Optional[str] = Field(default="https://storage.googleapis.com/pymap_profile_pics/profile_pics/user-profile.jpg")
    role: str = Field(default="user")
    phone: Optional[str] = Field(default=None)
    registered_at: Optional[str] = Field(default=datetime.utcnow().strftime("%d/%m/%Y"))
    suspended: bool = Field(default=False)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validar que la contraseña cumpla con los requisitos de seguridad"""
        validation_result = PasswordValidation.validate_password(v)
        
        if not validation_result['valid']:
            # Unir todos los errores en un mensaje
            error_message = "; ".join(validation_result['errors'])
            raise ValueError(f"Contraseña no válida: {error_message}")
        
        return v

class UserLogin(BaseModel):
    email: str = Field()
    password: str = Field()

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    rut: str = Field(...)
    name: str = Field(...)
    email: str = Field(...)
    birthdate: str = Field(...)
    isAuthenticated: bool = Field(...)
    balance: float = Field(...)
    profile_pic: Optional[str] = Field(default=None)
    role: str = Field(default="user")
    phone: Optional[str] = Field(default=None)
    registered_at: Optional[str] = Field(default=None)
    suspended: bool = Field(default=False)
    
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    @field_validator('id', mode='before')
    @classmethod
    def _id_to_str(cls, v: Any) -> str:
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_serializer('id')
    def _serialize_id(self, v: str) -> str:
        return str(v)
        
class UserUpdate(BaseModel):
    rut: str | None = None
    name: str | None = None
    email: str | None = None
    birthdate: str | None = None
    profile_pic: str | None = None
    phone: str | None = None
    role: str | None = None
    suspended: bool | None = None

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Validar que la nueva contraseña cumpla con los requisitos de seguridad"""
        validation_result = PasswordValidation.validate_password(v)
        
        if not validation_result['valid']:
            error_message = "; ".join(validation_result['errors'])
            raise ValueError(f"Contraseña no válida: {error_message}")
        
        return v
    
class UpdateBalanceRequest(BaseModel):
    amount: float
    isPositive: bool = True