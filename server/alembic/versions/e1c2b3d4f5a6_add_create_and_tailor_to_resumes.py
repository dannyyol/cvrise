"""add create_and_tailor to resumes

Revision ID: e1c2b3d4f5a6
Revises: 2421f5e8b192
Create Date: 2026-01-28 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1c2b3d4f5a6'
down_revision: Union[str, Sequence[str], None] = '2421f5e8b192'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('resumes', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('create_and_tailor', sa.Boolean(), nullable=False, server_default=sa.text('0'))
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('resumes', schema=None) as batch_op:
        batch_op.drop_column('create_and_tailor')

