import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.call import CallDirection, CallStatus


class CallCreate(BaseModel):
    external_id: str | None = None
    direction: CallDirection = CallDirection.UNKNOWN
    phone_number: str | None = None
    agent_id: uuid.UUID | None = None


class CallResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    agent_id: uuid.UUID | None
    external_id: str | None
    original_filename: str
    audio_format: str
    file_size_bytes: int
    duration_seconds: float | None
    direction: CallDirection
    phone_number: str | None
    status: CallStatus
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CallListResponse(BaseModel):
    items: list[CallResponse]
    total: int
    page: int
    page_size: int


class CallUploadResponse(BaseModel):
    id: uuid.UUID
    status: CallStatus
    message: str = "File uploaded successfully, processing started"


class CallBatchUploadResponse(BaseModel):
    uploaded: int
    failed: int
    calls: list[CallUploadResponse]
    errors: list[str] = Field(default_factory=list)


class ConversationStatsResponse(BaseModel):
    agent_talk_time: float
    client_talk_time: float
    silence_time: float
    total_duration: float
    talk_listen_ratio: float
    interruption_count: int
    agent_wpm: float
    client_wpm: float
    longest_monologue_duration: float
    longest_monologue_speaker: str | None
    agent_talk_pct: float
    client_talk_pct: float
    silence_pct: float


class TranscriptionResponse(BaseModel):
    call_id: uuid.UUID
    full_text: str
    language: str
    segments: list[dict]

    model_config = {"from_attributes": True}
