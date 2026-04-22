"""create ai_models table

Revision ID: 1ce5c70c5e12
Revises: d3805942e150
Create Date: 2026-01-28 09:51:54.791172

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '1ce5c70c5e12'
down_revision: Union[str, Sequence[str], None] = 'd3805942e150'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        'ai_models',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('provider', sa.String(length=64), nullable=False),
        sa.Column('key_id', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('ai_models')
