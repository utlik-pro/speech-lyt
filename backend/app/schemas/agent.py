import uuid
from datetime import datetime

from pydantic import BaseModel


class AgentCreate(BaseModel):
    name: str
    email: str | None = None
    team: str | None = None
    team_id: uuid.UUID | None = None


class AgentResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    email: str | None
    team: str | None
    team_id: uuid.UUID | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AgentListResponse(BaseModel):
    items: list[AgentResponse]
    total: int


class AgentLeaderboardEntry(BaseModel):
    agent_id: uuid.UUID
    name: str
    team: str | None
    total_calls: int
    avg_handle_time: float
    avg_script_score: float | None
    resolution_rate: float
    positive_sentiment_pct: float
    rank: int


class AgentLeaderboardResponse(BaseModel):
    period_start: datetime
    period_end: datetime
    entries: list[AgentLeaderboardEntry]


class AgentStatsResponse(BaseModel):
    agent: AgentResponse
    total_calls: int
    completed_calls: int
    avg_handle_time: float
    avg_script_score: float | None
    resolution_rate: float
    sentiment_distribution: dict[str, int]
    category_distribution: dict[str, int]
