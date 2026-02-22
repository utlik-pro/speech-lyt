import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class SentimentType(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class EmotionAnalysis(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "emotion_analyses"

    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("calls.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    overall_sentiment: Mapped[SentimentType] = mapped_column(
        Enum(SentimentType), nullable=False, default=SentimentType.NEUTRAL
    )
    agent_sentiment: Mapped[SentimentType] = mapped_column(
        Enum(SentimentType), nullable=False, default=SentimentType.NEUTRAL
    )
    client_sentiment: Mapped[SentimentType] = mapped_column(
        Enum(SentimentType), nullable=False, default=SentimentType.NEUTRAL
    )

    # JSON: [{time: float, sentiment: str, intensity: float}]
    emotion_timeline: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    # JSON: [{time: float, type: str, description: str}]
    critical_moments: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    call: Mapped["Call"] = relationship(back_populates="emotion_analysis")
