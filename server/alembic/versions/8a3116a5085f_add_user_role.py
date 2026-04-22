"""add_user_role

Revision ID: 8a3116a5085f
Revises: 247ecb72f125
Create Date: 2026-02-07 17:32:24.518700

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '8a3116a5085f'
down_revision: Union[str, Sequence[str], None] = '247ecb72f125'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('role', sa.Enum('USER', 'ADMIN', name='userrole'), server_default='user', nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('role')
