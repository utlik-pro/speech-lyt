import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Boolean, Float, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class QAScorecard(Base, UUIDMixin, TimestampMixin):
    """Template checklist for quality assessment."""

    __tablename__ = "qa_scorecards"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # JSON array of criteria definitions:
    # [{"id": "greeting", "name": "...", "category": "...", "weight": 10,
    #   "description": "...", "auto_source": "script_analysis|emotion|summary|conversation_stats|manual"}]
    criteria: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    evaluations: Mapped[list["QAEvaluation"]] = relationship(
        back_populates="scorecard", cascade="all, delete-orphan"
    )


class QAEvaluation(Base, UUIDMixin, TimestampMixin):
    """Result of quality evaluation for a specific call."""

    __tablename__ = "qa_evaluations"

    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("calls.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scorecard_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("qa_scorecards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    evaluator_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    total_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_possible_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # JSON array of per-criterion results:
    # [{"criterion_id": "greeting", "score": 10, "max_score": 10,
    #   "passed": true, "auto_evaluated": true, "notes": "..."}]
    results: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="completed", nullable=False
    )

    scorecard: Mapped["QAScorecard"] = relationship(back_populates="evaluations")
