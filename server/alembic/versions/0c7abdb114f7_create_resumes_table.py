"""create_resumes_table

Revision ID: 0c7abdb114f7
Revises: 
Create Date: 2026-01-25 17:52:25.082098

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0c7abdb114f7'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        'resumes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('template_id', sa.String(length=36), nullable=False),
        sa.Column('ai_analysis', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'theme_configs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('resume_id', sa.String(length=36), nullable=False),
        sa.Column('primary_color', sa.String(length=32), nullable=False),
        sa.Column('secondary_color', sa.String(length=32), nullable=False),
        sa.Column('font_family', sa.String(length=128), nullable=False),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('theme_configs')
    op.drop_table('resumes')
