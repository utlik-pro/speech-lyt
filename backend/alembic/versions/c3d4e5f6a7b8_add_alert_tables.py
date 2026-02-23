"""add_alert_tables

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-02-23 16:02:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'alert_rules',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('created_by', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('metric_name', sa.String(100), nullable=False),
        sa.Column('condition', sa.String(20), nullable=False),
        sa.Column('threshold', sa.Float(), nullable=False),
        sa.Column('severity', sa.String(20), nullable=False, server_default='warning'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('notify_email', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('notify_webhook', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('cooldown_minutes', sa.Integer(), nullable=False, server_default=sa.text('60')),
        sa.Column('last_triggered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'alert_history',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('rule_id', UUID(as_uuid=True), sa.ForeignKey('alert_rules.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('organization_id', UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('metric_name', sa.String(100), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('threshold', sa.Float(), nullable=False),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('acknowledged', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('acknowledged_by', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('alert_history')
    op.drop_table('alert_rules')
