from pydantic import BaseModel, Field, field_validator, field_serializer
from pydantic.config import ConfigDict
from typing import Optional, Any
from bson import ObjectId
from datetime import datetime, time

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

class TimeSlot(BaseModel):
    """Intervalo de tiempo disponible"""
    start_time: str = Field(..., description="Hora inicio (HH:MM)")
    end_time: str = Field(..., description="Hora fin (HH:MM)")
    is_available: bool = Field(default=True)
    
class BusinessAvailability(BaseModel):
    """Disponibilidad de un negocio para un día específico"""
    business_id: str = Field(...)
    date: str = Field(..., description="Fecha (YYYY-MM-DD)")
    time_slots: list[TimeSlot] = Field(default_factory=list)
    max_concurrent_bookings: int = Field(default=1, description="Reservas simultáneas permitidas")

class BookingRequest(BaseModel):
    """Solicitud de reserva de un cliente"""
    business_id: str = Field(...)
    client_id: Optional[str] = Field(default=None)
    date: str = Field(..., description="Fecha (YYYY-MM-DD)")
    start_time: str = Field(..., description="Hora inicio (HH:MM)")
    end_time: str = Field(..., description="Hora fin (HH:MM)")
    service_description: Optional[str] = None
    status: str = Field(default="pending", description="pending, confirmed, cancelled")
    created_at: datetime = Field(default_factory=datetime.now)

class BookingResponse(BaseModel):
    id: str = Field(alias="_id")
    business_id: str
    client_id: str
    date: str
    start_time: str
    end_time: str
    service_description: Optional[str] = None
    status: str
    created_at: datetime
    
    class Config:
        populate_by_name = True