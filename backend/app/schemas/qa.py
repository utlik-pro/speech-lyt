import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class QACriterionDef(BaseModel):
    id: str = Field(..., description="Unique criterion identifier, e.g. 'greeting'")
    name: str = Field(..., min_length=1)
    category: str = Field(default="general")
    weight: int = Field(default=10, ge=1, le=100)
    description: str = Field(default="")
    auto_source: str = Field(
        default="manual",
        description="script_analysis | emotion | summary | conversation_stats | manual",
    )


class QAScorecardCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    criteria: list[QACriterionDef] = Field(default_factory=list)


class QAScorecardUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    is_active: bool | None = None
    criteria: list[QACriterionDef] | None = None


class QAScorecardResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    description: str | None
    is_active: bool
    criteria: list[dict]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QAScorecardListResponse(BaseModel):
    items: list[QAScorecardResponse]
    total: int


class QAResultItem(BaseModel):
    criterion_id: str
    score: float
    max_score: float
    passed: bool
    auto_evaluated: bool = False
    notes: str = ""


class QAEvaluationResponse(BaseModel):
    id: uuid.UUID
    call_id: uuid.UUID
    scorecard_id: uuid.UUID
    evaluator_id: uuid.UUID | None
    total_score: float
    max_possible_score: float
    results: list[dict]
    comments: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QAEvaluationListResponse(BaseModel):
    items: list[QAEvaluationResponse]
    total: int


class EvaluateRequest(BaseModel):
    scorecard_id: uuid.UUID
