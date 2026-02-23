import uuid

from sqlalchemy import Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class CallKPI(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "call_kpis"

    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("calls.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Per-call KPI metrics (PRD section 6.10)
    aht: Mapped[float | None] = mapped_column(Float, nullable=True)
    talk_listen_ratio: Mapped[float | None] = mapped_column(Float, nullable=True)
    silence_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    speech_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    hold_time: Mapped[float | None] = mapped_column(Float, nullable=True)
    script_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    fcr: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relationships
    call: Mapped["Call"] = relationship(back_populates="kpi")
