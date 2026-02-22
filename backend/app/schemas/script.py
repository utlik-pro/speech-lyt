import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.script import ScriptType


# --- Script Stage schemas ---


class ScriptStageCreate(BaseModel):
    order: int = Field(default=0, ge=0, description="Stage order in the script")
    name: str = Field(..., min_length=1, max_length=255)
    required_phrases: list[str] = Field(default_factory=list, description="Phrases the agent must say (semantic match)")
    forbidden_words: list[str] = Field(default_factory=list, description="Words the agent must not say (exact match)")
    is_required: bool = Field(default=True, description="Whether this stage is mandatory")
    max_duration_seconds: int | None = Field(default=None, ge=1, description="Max allowed duration for this stage")


class ScriptStageUpdate(BaseModel):
    order: int | None = Field(default=None, ge=0)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    required_phrases: list[str] | None = None
    forbidden_words: list[str] | None = None
    is_required: bool | None = None
    max_duration_seconds: int | None = None


class ScriptStageResponse(BaseModel):
    id: uuid.UUID
    script_id: uuid.UUID
    order: int
    name: str
    required_phrases: list[str]
    forbidden_words: list[str]
    is_required: bool
    max_duration_seconds: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Script schemas ---


class ScriptCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: ScriptType = Field(default=ScriptType.SUPPORT)
    description: str | None = Field(default=None)
    is_active: bool = Field(default=True)
    stages: list[ScriptStageCreate] = Field(default_factory=list, description="Script stages to create")


class ScriptUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: ScriptType | None = None
    description: str | None = None
    is_active: bool | None = None


class ScriptResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    type: ScriptType
    description: str | None
    is_active: bool
    stages: list[ScriptStageResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ScriptListResponse(BaseModel):
    items: list[ScriptResponse]
    total: int
    page: int
    page_size: int


# --- Script Analysis schemas ---


class StageResultItem(BaseModel):
    stage_id: str
    stage_name: str
    passed: bool
    score: float = Field(ge=0, le=100)
    matched_phrases: list[str] = Field(default_factory=list)
    missing_phrases: list[str] = Field(default_factory=list)
    found_forbidden_words: list[str] = Field(default_factory=list)
    notes: str = ""


class ViolationItem(BaseModel):
    stage_name: str
    type: str  # "missing_phrase", "forbidden_word", "stage_skipped", "duration_exceeded"
    description: str
    severity: str = "medium"  # "low", "medium", "high", "critical"


class ScriptAnalysisResponse(BaseModel):
    id: uuid.UUID
    call_id: uuid.UUID
    script_id: uuid.UUID
    overall_score: float
    stage_results: list[StageResultItem]
    violations: list[ViolationItem]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AnalyzeScriptRequest(BaseModel):
    script_id: uuid.UUID = Field(..., description="ID of the script to check compliance against")
