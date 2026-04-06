"""add sidebar_section_keys to templates

Revision ID: ab12cd34ef56
Revises: b23f8014bfd3
Create Date: 2026-03-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'ab12cd34ef56'
down_revision: Union[str, Sequence[str], None] = 'b23f8014bfd3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('templates', schema=None) as batch_op:
        batch_op.add_column(sa.Column('sidebar_section_keys', sa.JSON(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('templates', schema=None) as batch_op:
        batch_op.drop_column('sidebar_section_keys')
