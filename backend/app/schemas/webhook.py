import uuid
from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class WebhookCreate(BaseModel):
    url: HttpUrl = Field(..., description="URL to send webhook POST requests to")
    events: list[str] = Field(
        default_factory=lambda: ["call.completed"],
        description="List of events to subscribe to (e.g. call.completed, call.failed)",
    )
    is_active: bool = Field(default=True)


class WebhookUpdate(BaseModel):
    url: HttpUrl | None = Field(default=None)
    events: list[str] | None = Field(default=None)
    is_active: bool | None = Field(default=None)


class WebhookResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    url: str
    events: list[str]
    is_active: bool
    secret: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WebhookListResponse(BaseModel):
    items: list[WebhookResponse]
    total: int
    page: int
    page_size: int


class WebhookTestResponse(BaseModel):
    success: bool
    status_code: int | None = None
    message: str
