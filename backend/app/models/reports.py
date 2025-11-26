from bson import ObjectId
from pydantic import BaseModel, Field, field_validator, field_serializer
from typing import Optional
from datetime import datetime, timedelta

class Report(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    bookingId: Optional[str] = Field(default=None)
    businessId: Optional[str] = Field(default=None)
    businessName: Optional[str] = Field(default=None)
    serviceDescription: Optional[str] = Field(default=None)
    reportedBy: str = Field(...)
    reportedByName: Optional[str] = Field(default=None)
    reportedByEmail: Optional[str] = Field(default=None)
    type: str = Field(...)
    description: str = Field(...)
    state: str = Field(default="open")
    timestamp: str = Field(default=datetime.utcnow().isoformat())

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_schema_extra": {"by_alias": True}
    }

    @field_validator('id', mode='before')
    @classmethod
    def _id_to_str(cls, v):
        if v is None:
            return None
        return str(v) if isinstance(v, ObjectId) else str(v)

    @field_serializer('id', check_fields=False)
    def _serialize_id(self, v):
        return str(v) if v is not None else None