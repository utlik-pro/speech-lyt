import uuid
from datetime import datetime

from pydantic import BaseModel


class OrganizationCreate(BaseModel):
    name: str
    plan: str = "free"


class OrganizationResponse(BaseModel):
    id: uuid.UUID
    name: str
    plan: str
    settings: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
