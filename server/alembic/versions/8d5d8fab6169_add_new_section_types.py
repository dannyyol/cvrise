"""add_new_section_types

Revision ID: 8d5d8fab6169
Revises: b03c3aa972a0
Create Date: 2026-01-27 20:14:11.569336

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '8d5d8fab6169'
down_revision: Union[str, Sequence[str], None] = 'b03c3aa972a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        'interests',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('section_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('keywords', sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['section_id'], ['sections.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'languages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('section_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('proficiency', sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(['section_id'], ['sections.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'websites',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('section_id', sa.String(length=36), nullable=False),
        sa.Column('label', sa.String(length=255), nullable=False),
        sa.Column('link', sa.String(length=512), nullable=False),
        sa.ForeignKeyConstraint(['section_id'], ['sections.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('custom_section_items', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=255), nullable=False))
        batch_op.add_column(sa.Column('description', sa.Text(), nullable=False))
        batch_op.add_column(sa.Column('date', sa.String(length=32), nullable=False))
        batch_op.add_column(sa.Column('location', sa.String(length=255), nullable=False))
        batch_op.drop_column('content')

    with op.batch_alter_table('sections', schema=None) as batch_op:
        batch_op.drop_column('schema')
        batch_op.drop_column('is_custom')


def downgrade() -> None:
    """Downgrade schema."""

    with op.batch_alter_table('sections', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_custom', sa.BOOLEAN(), nullable=False, server_default=sa.text('0')))
        batch_op.add_column(sa.Column('schema', sa.JSON(), nullable=True))

    with op.batch_alter_table('custom_section_items', schema=None) as batch_op:
        batch_op.add_column(sa.Column('content', sa.JSON(), nullable=False))
        batch_op.drop_column('location')
        batch_op.drop_column('date')
        batch_op.drop_column('description')
        batch_op.drop_column('name')

    op.drop_table('websites')
    op.drop_table('languages')
    op.drop_table('interests')
