import enum
import uuid

from sqlalchemy import BigInteger, Enum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class CallStatus(str, enum.Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    PROCESSING = "processing"
    TRANSCRIBING = "transcribing"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class CallDirection(str, enum.Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    UNKNOWN = "unknown"


class Call(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "calls"

    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    agent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Audio info
    audio_url: Mapped[str] = mapped_column(Text, nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    audio_format: Mapped[str] = mapped_column(String(10), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    sample_rate: Mapped[int | None] = mapped_column(nullable=True)
    channels: Mapped[int | None] = mapped_column(nullable=True)

    # Call metadata
    direction: Mapped[CallDirection] = mapped_column(
        Enum(CallDirection), default=CallDirection.UNKNOWN, nullable=False
    )
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[CallStatus] = mapped_column(
        Enum(CallStatus), default=CallStatus.PENDING, nullable=False, index=True
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    transcription: Mapped["Transcription | None"] = relationship(back_populates="call", uselist=False)
    summary: Mapped["CallSummary | None"] = relationship(back_populates="call", uselist=False)
    emotion_analysis: Mapped["EmotionAnalysis | None"] = relationship(back_populates="call", uselist=False)
