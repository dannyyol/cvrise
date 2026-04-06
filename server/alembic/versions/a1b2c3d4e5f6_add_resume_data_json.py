"""add resume_data json to resumes

Revision ID: a1b2c3d4e5f6
Revises: c8d131fdaf0b
Create Date: 2026-02-01 22:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '7c1b8a9f2e31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('resumes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('resume_data', sa.JSON(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('resumes', schema=None) as batch_op:
        batch_op.drop_column('resume_data')
