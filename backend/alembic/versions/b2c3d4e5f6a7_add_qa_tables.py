"""add_qa_tables

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-23 16:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'qa_scorecards',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('criteria', JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        'qa_evaluations',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('call_id', UUID(as_uuid=True), sa.ForeignKey('calls.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('scorecard_id', UUID(as_uuid=True), sa.ForeignKey('qa_scorecards.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('evaluator_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('total_score', sa.Float(), nullable=False, server_default=sa.text('0')),
        sa.Column('max_possible_score', sa.Float(), nullable=False, server_default=sa.text('0')),
        sa.Column('results', JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='completed'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('qa_evaluations')
    op.drop_table('qa_scorecards')
