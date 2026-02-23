import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.integration_config import IntegrationType


class IntegrationCreate(BaseModel):
    integration_type: IntegrationType
    name: str
    credentials: dict = {}
    settings: dict = {}
    is_active: bool = True


class IntegrationUpdate(BaseModel):
    name: str | None = None
    credentials: dict | None = None
    settings: dict | None = None
    is_active: bool | None = None


class IntegrationResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    integration_type: IntegrationType
    name: str
    settings: dict
    is_active: bool
    last_sync_status: str | None
    last_sync_error: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IntegrationListResponse(BaseModel):
    items: list[IntegrationResponse]
    total: int


class IntegrationTestResponse(BaseModel):
    success: bool
    message: str


class IntegrationStatusResponse(BaseModel):
    type: str
    connected: bool
    message: str
    details: dict = {}


class IntegrationSyncRequest(BaseModel):
    call_id: uuid.UUID


class IntegrationSyncResponse(BaseModel):
    integration_id: uuid.UUID
    external_id: str | None
    status: str
    details: dict = {}
