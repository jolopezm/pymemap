from pydantic import BaseModel, Field, field_validator, field_serializer
from pydantic.config import ConfigDict
from typing import Optional, Any
from bson import ObjectId

class Business(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str = Field(...)
    address: str = Field(...)
    category: str = Field(...)
    description: str = Field(...)
    #owner_id: PyObjectId = Field(default_factory=PyObjectId)
    owner_id: str = Field(...)
    profile_pic: Optional[str] = Field(default=None)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    
    model_config = ConfigDict(
        populate_by_name=True, 
        arbitrary_types_allowed=True,
        json_schema_extra={"by_alias": True},
        json_encoders={ObjectId: str}
    )
    
    @field_validator('id', mode='before')
    @classmethod
    def _id_to_str(cls, v: Any) -> str:
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_serializer('id', when_used='always')
    def _serialize_id(self, v: Optional[str]) -> Optional[str]:
        return str(v) if v is not None else None
    
class Service(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str = Field(...)
    description: str = Field(...)
    price: float = Field(default=0.0)
    state: str = Field(default="pending")
    business_id: str = Field(...)
    client_id: str = Field(...)
    requested_price: Optional[float] = Field(default=None)
    paid_at: Optional[str] = Field(default=None)
    
    model_config = ConfigDict(
        populate_by_name=True, 
        arbitrary_types_allowed=True,
        json_schema_extra={"by_alias": True}
    )
    
    @field_validator('id', mode='before')
    @classmethod
    def _id_to_str(cls, v: Any) -> str:
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_serializer('id', when_used='always')
    def _serialize_id(self, v: Optional[str]) -> Optional[str]:
        return str(v) if v is not None else None