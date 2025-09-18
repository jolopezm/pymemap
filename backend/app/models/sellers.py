from pydantic import BaseModel, Field

class Business(BaseModel):
    name: str = Field(...)
    address: str = Field(...)
    category: str = Field(...)
    description: str = Field(...)
    #owner_id: PyObjectId = Field(default_factory=PyObjectId)
    owner_id: str = Field(...)