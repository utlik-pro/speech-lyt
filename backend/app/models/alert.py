import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Boolean, Float, Integer, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class AlertRule(Base, UUIDMixin, TimestampMixin):
    """User-configurable KPI alert rule."""

    __tablename__ = "alert_rules"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    condition: Mapped[str] = mapped_column(String(20), nullable=False)  # "above" | "below"
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(
        String(20), default="warning", nullable=False
    )  # "info" | "warning" | "critical"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    notify_email: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notify_webhook: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    cooldown_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    last_triggered_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class AlertHistory(Base, UUIDMixin):
    """Log of triggered alerts."""

    __tablename__ = "alert_history"

    rule_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("alert_rules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )

    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    metric_value: Mapped[float] = mapped_column(Float, nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    acknowledged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    acknowledged_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    acknowledged_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
