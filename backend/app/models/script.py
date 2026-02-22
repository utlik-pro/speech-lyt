import enum
import uuid

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class ScriptType(str, enum.Enum):
    SALES = "sales"
    SUPPORT = "support"
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class Script(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "scripts"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[ScriptType] = mapped_column(
        Enum(ScriptType), nullable=False, default=ScriptType.SUPPORT
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    stages: Mapped[list["ScriptStage"]] = relationship(
        back_populates="script",
        cascade="all, delete-orphan",
        order_by="ScriptStage.order",
    )
    analyses: Mapped[list["ScriptAnalysis"]] = relationship(
        back_populates="script",
        cascade="all, delete-orphan",
    )


class ScriptStage(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "script_stages"

    script_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scripts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Compliance rules
    required_phrases: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    forbidden_words: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    max_duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    script: Mapped["Script"] = relationship(back_populates="stages")


class ScriptAnalysis(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "script_analyses"

    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("calls.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    script_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scripts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Results
    overall_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # Per-stage results: [{stage_id, stage_name, passed, score, matched_phrases, missing_phrases, notes}]
    stage_results: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    # Violations: [{stage_name, type, description, severity}]
    violations: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    script: Mapped["Script"] = relationship(back_populates="analyses")
