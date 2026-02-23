"""Coaching insight model — AI-generated recommendations for manager training."""

import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class CoachingInsight(Base, UUIDMixin, TimestampMixin):
    """AI-generated coaching recommendation for a specific manager."""

    __tablename__ = "coaching_insights"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    manager_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),  # FK to agents table (Manager)
        nullable=False,
        index=True,
    )
    ai_agent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ai_agents.id", ondelete="SET NULL"),
        nullable=True,
    )
    ai_agent_run_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ai_agent_runs.id", ondelete="SET NULL"),
        nullable=True,
    )

    insight_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # insight_type: "skill_gap" | "training_need" | "coaching_recommendation" |
    #               "performance_trend" | "strength" | "improvement_area"

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(
        String(20), default="medium", nullable=False
    )
    # priority: "low" | "medium" | "high" | "critical"

    # Structured data for the insight
    metadata_json: Mapped[dict] = mapped_column(
        JSON, default=dict, nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20), default="active", nullable=False
    )
    # status: "active" | "acknowledged" | "resolved" | "dismissed"

    acknowledged_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    # Relationships
    organization: Mapped["Organization"] = relationship()
    manager: Mapped["Manager"] = relationship()
    ai_agent: Mapped["AIAgent | None"] = relationship()
