"""AI Agent models — configurable AI bots for call analysis and coaching."""

import uuid

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class AIAgent(Base, UUIDMixin, TimestampMixin):
    """Configurable AI agent that runs analysis pipelines on calls."""

    __tablename__ = "ai_agents"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    agent_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="analyzer"
    )
    # agent_type: "analyzer" | "coach" | "qa_reviewer" | "custom"

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # LLM configuration
    model_name: Mapped[str] = mapped_column(
        String(100), nullable=False, default="gpt-4o-mini"
    )
    temperature: Mapped[float] = mapped_column(Float, default=0.3, nullable=False)
    max_tokens: Mapped[int] = mapped_column(Integer, default=2048, nullable=False)

    # Pipeline configuration — JSON array of step definitions
    # Each step: {"step_type": "emotion_analysis"|"summary"|..., "enabled": true, "order": 1, "config": {}}
    pipeline_steps: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship(back_populates="ai_agents")
    prompt_templates: Mapped[list["AIAgentPrompt"]] = relationship(
        back_populates="ai_agent", cascade="all, delete-orphan"
    )
    runs: Mapped[list["AIAgentRun"]] = relationship(
        back_populates="ai_agent", cascade="all, delete-orphan"
    )


class AIAgentPrompt(Base, UUIDMixin, TimestampMixin):
    """Custom prompt template for a specific pipeline step of an AI agent."""

    __tablename__ = "ai_agent_prompts"

    ai_agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ai_agents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    step_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # step_type: "emotion_analysis" | "summary" | "script_compliance" | "coaching" | "custom"

    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    user_prompt_template: Mapped[str] = mapped_column(Text, nullable=False)

    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    ai_agent: Mapped["AIAgent"] = relationship(back_populates="prompt_templates")


class AIAgentRun(Base, UUIDMixin, TimestampMixin):
    """Record of an AI agent pipeline execution on a specific call."""

    __tablename__ = "ai_agent_runs"

    ai_agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ai_agents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("calls.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False
    )
    # status: "pending" | "running" | "completed" | "failed"

    # Results from each pipeline step
    step_results: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    total_duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Token usage tracking
    total_input_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_output_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    ai_agent: Mapped["AIAgent"] = relationship(back_populates="runs")
    call: Mapped["Call"] = relationship()
