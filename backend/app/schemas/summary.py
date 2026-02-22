import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class EntityItem(BaseModel):
    """Extracted entity from a call (name, contract number, amount, date, product, etc.)."""

    name: str = Field(..., description="Entity label, e.g. 'client_name', 'contract_number', 'amount'")
    type: str = Field(..., description="Entity type: person, number, date, amount, product, organization")
    value: str = Field(..., description="Extracted value")


class CallSummaryResponse(BaseModel):
    id: uuid.UUID
    call_id: uuid.UUID

    short_summary: str
    topic: str
    problem: str | None
    solution: str | None
    outcome: str
    next_steps: str | None

    entities: list[EntityItem] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    category: str | None

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
