"""Pydantic schemas for AI Agents."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class PipelineStepConfig(BaseModel):
    step_type: str  # emotion_analysis | summary | script_compliance | qa_evaluation | coaching | custom
    enabled: bool = True
    order: int
    config: dict = {}


class AIAgentCreate(BaseModel):
    name: str
    description: str | None = None
    agent_type: str = "analyzer"
    model_name: str = "gpt-4o-mini"
    temperature: float = 0.3
    max_tokens: int = 2048
    pipeline_steps: list[PipelineStepConfig] = []


class AIAgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    agent_type: str | None = None
    model_name: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None
    pipeline_steps: list[PipelineStepConfig] | None = None
    is_active: bool | None = None


class AIAgentResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    description: str | None
    agent_type: str
    is_active: bool
    model_name: str
    temperature: float
    max_tokens: int
    pipeline_steps: list[PipelineStepConfig]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AIAgentListResponse(BaseModel):
    items: list[AIAgentResponse]
    total: int


# ── Prompt schemas ─────────────────────────────────────────────────────────


class AIAgentPromptCreate(BaseModel):
    step_type: str
    system_prompt: str
    user_prompt_template: str


class AIAgentPromptUpdate(BaseModel):
    system_prompt: str | None = None
    user_prompt_template: str | None = None


class AIAgentPromptResponse(BaseModel):
    id: uuid.UUID
    ai_agent_id: uuid.UUID
    step_type: str
    system_prompt: str
    user_prompt_template: str
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Run schemas ────────────────────────────────────────────────────────────


class AIAgentRunResponse(BaseModel):
    id: uuid.UUID
    ai_agent_id: uuid.UUID
    call_id: uuid.UUID
    status: str
    step_results: list[dict]
    total_duration_ms: int | None
    error_message: str | None
    total_input_tokens: int
    total_output_tokens: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AIAgentRunListResponse(BaseModel):
    items: list[AIAgentRunResponse]
    total: int


# ── Coaching schemas ───────────────────────────────────────────────────────


class CoachingInsightResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    manager_id: uuid.UUID
    ai_agent_id: uuid.UUID | None
    insight_type: str
    title: str
    description: str
    priority: str
    metadata_json: dict
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CoachingInsightListResponse(BaseModel):
    items: list[CoachingInsightResponse]
    total: int


# ── Default prompts ────────────────────────────────────────────────────────


class DefaultPromptResponse(BaseModel):
    step_type: str
    system_prompt: str
    user_prompt_template: str
