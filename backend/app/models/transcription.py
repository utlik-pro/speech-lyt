import uuid

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Transcription(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "transcriptions"

    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("calls.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    full_text: Mapped[str] = mapped_column(Text, nullable=False, default="")
    language: Mapped[str] = mapped_column(default="ru", nullable=False)

    # Segments: [{speaker, text, start_time, end_time, confidence}]
    segments: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    # ASR metadata
    asr_provider: Mapped[str] = mapped_column(default="openai-whisper", nullable=False)
    asr_model: Mapped[str] = mapped_column(default="whisper-1", nullable=False)

    call: Mapped["Call"] = relationship(back_populates="transcription")
