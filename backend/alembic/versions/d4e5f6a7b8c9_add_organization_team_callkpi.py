"""add_organization_team_callkpi

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-02-23 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON


revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create organizations table
    op.create_table(
        "organizations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("plan", sa.String(20), nullable=False, server_default="free"),
        sa.Column("settings", JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 2. Backfill organizations from all existing organization_id values
    op.execute("""
        INSERT INTO organizations (id, name, plan, settings)
        SELECT DISTINCT organization_id, 'Organization ' || organization_id::text, 'free', '{}'::json
        FROM (
            SELECT organization_id FROM agents WHERE organization_id IS NOT NULL
            UNION SELECT organization_id FROM calls WHERE organization_id IS NOT NULL
            UNION SELECT organization_id FROM scripts WHERE organization_id IS NOT NULL
            UNION SELECT organization_id FROM alert_rules WHERE organization_id IS NOT NULL
            UNION SELECT organization_id FROM alert_history WHERE organization_id IS NOT NULL
            UNION SELECT organization_id FROM qa_scorecards WHERE organization_id IS NOT NULL
            UNION SELECT organization_id FROM api_keys WHERE organization_id IS NOT NULL
            UNION SELECT organization_id FROM audit_logs WHERE organization_id IS NOT NULL
            UNION SELECT organization_id FROM webhooks WHERE organization_id IS NOT NULL
        ) AS all_org_ids
        ON CONFLICT (id) DO NOTHING
    """)

    # Also backfill from users table (may not exist yet in some setups)
    op.execute("""
        INSERT INTO organizations (id, name, plan, settings)
        SELECT DISTINCT organization_id, 'Organization ' || organization_id::text, 'free', '{}'::json
        FROM users
        WHERE organization_id IS NOT NULL
        ON CONFLICT (id) DO NOTHING
    """)

    # 3. Create teams table
    op.create_table(
        "teams",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "organization_id", UUID(as_uuid=True),
            sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "supervisor_id", UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_teams_organization_id", "teams", ["organization_id"])

    # 4. Backfill teams from distinct Agent.team values
    op.execute("""
        INSERT INTO teams (id, organization_id, name)
        SELECT gen_random_uuid(), organization_id, team
        FROM (
            SELECT DISTINCT organization_id, team
            FROM agents
            WHERE team IS NOT NULL AND organization_id IS NOT NULL
        ) AS distinct_teams
    """)

    # 5. Add team_id column to agents
    op.add_column("agents", sa.Column("team_id", UUID(as_uuid=True), nullable=True))
    op.create_index("ix_agents_team_id", "agents", ["team_id"])
    op.create_foreign_key(
        "fk_agents_team_id", "agents", "teams",
        ["team_id"], ["id"], ondelete="SET NULL",
    )

    # 6. Backfill agents.team_id
    op.execute("""
        UPDATE agents SET team_id = teams.id
        FROM teams
        WHERE agents.team = teams.name
          AND agents.organization_id = teams.organization_id
    """)

    # 7. Create call_kpis table
    op.create_table(
        "call_kpis",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "call_id", UUID(as_uuid=True),
            sa.ForeignKey("calls.id", ondelete="CASCADE"),
            nullable=False, unique=True,
        ),
        sa.Column("aht", sa.Float(), nullable=True),
        sa.Column("talk_listen_ratio", sa.Float(), nullable=True),
        sa.Column("silence_rate", sa.Float(), nullable=True),
        sa.Column("speech_rate", sa.Float(), nullable=True),
        sa.Column("hold_time", sa.Float(), nullable=True),
        sa.Column("script_score", sa.Float(), nullable=True),
        sa.Column("fcr", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 8. Add FK constraints for organization_id on all existing tables
    tables_with_org_id = [
        "users", "agents", "calls", "scripts",
        "alert_rules", "alert_history", "qa_scorecards",
        "api_keys", "audit_logs", "webhooks",
    ]
    for table in tables_with_org_id:
        op.create_foreign_key(
            f"fk_{table}_organization_id", table, "organizations",
            ["organization_id"], ["id"], ondelete="CASCADE",
        )


def downgrade() -> None:
    # Remove FK constraints from organization_id
    tables_with_org_id = [
        "users", "agents", "calls", "scripts",
        "alert_rules", "alert_history", "qa_scorecards",
        "api_keys", "audit_logs", "webhooks",
    ]
    for table in tables_with_org_id:
        op.drop_constraint(f"fk_{table}_organization_id", table, type_="foreignkey")

    # Drop call_kpis
    op.drop_table("call_kpis")

    # Remove team_id from agents
    op.drop_constraint("fk_agents_team_id", "agents", type_="foreignkey")
    op.drop_index("ix_agents_team_id", table_name="agents")
    op.drop_column("agents", "team_id")

    # Drop teams
    op.drop_index("ix_teams_organization_id", table_name="teams")
    op.drop_table("teams")

    # Drop organizations
    op.drop_table("organizations")
