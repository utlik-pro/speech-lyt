import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class APIKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="A human-readable name for this API key")


class APIKeyCreateResponse(BaseModel):
    """Returned only once when the key is created. The raw key is never stored."""
    id: uuid.UUID
    name: str
    key: str = Field(..., description="The raw API key. Store this securely -- it cannot be retrieved again.")
    created_at: datetime

    model_config = {"from_attributes": True}


class APIKeyResponse(BaseModel):
    """Public representation of an API key (no raw key)."""
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    is_active: bool
    last_used_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class APIKeyListResponse(BaseModel):
    items: list[APIKeyResponse]
    total: int
