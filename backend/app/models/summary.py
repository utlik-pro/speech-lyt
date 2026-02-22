import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class CallSummary(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "call_summaries"

    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("calls.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    short_summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    topic: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    problem: Mapped[str | None] = mapped_column(Text, nullable=True)
    solution: Mapped[str | None] = mapped_column(Text, nullable=True)
    outcome: Mapped[str] = mapped_column(String(100), nullable=False, default="unresolved")
    next_steps: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Extracted entities: [{"name": "...", "type": "...", "value": "..."}]
    entities: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    # Auto-generated tags: ["billing", "complaint", ...]
    tags: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relationships
    call: Mapped["Call"] = relationship(back_populates="summary")
