"""add_ai_agents

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-02-23 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON


revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, None] = "e5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create ai_agents table
    op.create_table(
        "ai_agents",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "organization_id", UUID(as_uuid=True),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("agent_type", sa.String(50), nullable=False, server_default="analyzer"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("model_name", sa.String(100), nullable=False, server_default="gpt-4o-mini"),
        sa.Column("temperature", sa.Float(), nullable=False, server_default=sa.text("0.3")),
        sa.Column("max_tokens", sa.Integer(), nullable=False, server_default=sa.text("2048")),
        sa.Column("pipeline_steps", JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ai_agents_organization_id", "ai_agents", ["organization_id"])

    # 2. Create ai_agent_prompts table
    op.create_table(
        "ai_agent_prompts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "ai_agent_id", UUID(as_uuid=True),
            sa.ForeignKey("ai_agents.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("step_type", sa.String(50), nullable=False),
        sa.Column("system_prompt", sa.Text(), nullable=False),
        sa.Column("user_prompt_template", sa.Text(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ai_agent_prompts_ai_agent_id", "ai_agent_prompts", ["ai_agent_id"])

    # 3. Create ai_agent_runs table
    op.create_table(
        "ai_agent_runs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "ai_agent_id", UUID(as_uuid=True),
            sa.ForeignKey("ai_agents.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column(
            "call_id", UUID(as_uuid=True),
            sa.ForeignKey("calls.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("step_results", JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("total_duration_ms", sa.Integer(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("total_input_tokens", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("total_output_tokens", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ai_agent_runs_ai_agent_id", "ai_agent_runs", ["ai_agent_id"])
    op.create_index("ix_ai_agent_runs_call_id", "ai_agent_runs", ["call_id"])

    # 4. Create coaching_insights table
    op.create_table(
        "coaching_insights",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "organization_id", UUID(as_uuid=True),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column(
            "manager_id", UUID(as_uuid=True),
            sa.ForeignKey("agents.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column(
            "ai_agent_id", UUID(as_uuid=True),
            sa.ForeignKey("ai_agents.id", ondelete="SET NULL"), nullable=True,
        ),
        sa.Column(
            "ai_agent_run_id", UUID(as_uuid=True),
            sa.ForeignKey("ai_agent_runs.id", ondelete="SET NULL"), nullable=True,
        ),
        sa.Column("insight_type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("priority", sa.String(20), nullable=False, server_default="medium"),
        sa.Column("metadata_json", JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("acknowledged_by", UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_coaching_insights_organization_id", "coaching_insights", ["organization_id"])
    op.create_index("ix_coaching_insights_manager_id", "coaching_insights", ["manager_id"])


def downgrade() -> None:
    op.drop_table("coaching_insights")
    op.drop_table("ai_agent_runs")
    op.drop_table("ai_agent_prompts")
    op.drop_table("ai_agents")
