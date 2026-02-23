import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class AlertRuleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    metric_name: str = Field(..., min_length=1, max_length=100)
    condition: str = Field(..., pattern=r"^(above|below)$")
    threshold: float
    severity: str = Field(default="warning", pattern=r"^(info|warning|critical)$")
    notify_email: bool = False
    notify_webhook: bool = False
    cooldown_minutes: int = Field(default=60, ge=1)


class AlertRuleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    metric_name: str | None = Field(default=None, min_length=1, max_length=100)
    condition: str | None = Field(default=None, pattern=r"^(above|below)$")
    threshold: float | None = None
    severity: str | None = Field(default=None, pattern=r"^(info|warning|critical)$")
    is_active: bool | None = None
    notify_email: bool | None = None
    notify_webhook: bool | None = None
    cooldown_minutes: int | None = Field(default=None, ge=1)


class AlertRuleResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    created_by: uuid.UUID | None
    name: str
    metric_name: str
    condition: str
    threshold: float
    severity: str
    is_active: bool
    notify_email: bool
    notify_webhook: bool
    cooldown_minutes: int
    last_triggered_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AlertRuleListResponse(BaseModel):
    items: list[AlertRuleResponse]
    total: int


class AlertHistoryResponse(BaseModel):
    id: uuid.UUID
    rule_id: uuid.UUID
    organization_id: uuid.UUID
    metric_name: str
    metric_value: float
    threshold: float
    severity: str
    message: str
    acknowledged: bool
    acknowledged_by: uuid.UUID | None
    acknowledged_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertHistoryListResponse(BaseModel):
    items: list[AlertHistoryResponse]
    total: int
