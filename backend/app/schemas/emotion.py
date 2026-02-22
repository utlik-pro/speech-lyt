import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.emotion import SentimentType


class EmotionTimelinePoint(BaseModel):
    """A single point on the emotion timeline of a call."""

    time: float = Field(..., description="Timestamp in seconds from the start of the call")
    sentiment: SentimentType = Field(..., description="Sentiment at this point in time")
    intensity: float = Field(
        ..., ge=0.0, le=1.0, description="Intensity of the sentiment (0.0 to 1.0)"
    )


class CriticalMoment(BaseModel):
    """A critical moment detected during the call (conflict, complaint, gratitude, etc.)."""

    time: float = Field(..., description="Timestamp in seconds from the start of the call")
    type: str = Field(
        ..., description="Type of critical moment: conflict, complaint, gratitude, aggression, escalation"
    )
    description: str = Field(..., description="Brief description of what happened")


class EmotionAnalysisResponse(BaseModel):
    """Full emotion analysis result for a call."""

    id: uuid.UUID
    call_id: uuid.UUID
    overall_sentiment: SentimentType
    agent_sentiment: SentimentType
    client_sentiment: SentimentType
    emotion_timeline: list[EmotionTimelinePoint]
    critical_moments: list[CriticalMoment]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
