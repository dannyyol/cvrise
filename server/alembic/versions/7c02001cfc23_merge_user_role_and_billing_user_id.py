"""merge_user_role_and_billing_user_id

Revision ID: 7c02001cfc23
Revises: 8a3116a5085f, f1e2d3c4b5a6
Create Date: 2026-02-07 22:25:00.401016

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '7c02001cfc23'
down_revision: Union[str, Sequence[str], None] = ('8a3116a5085f', 'f1e2d3c4b5a6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
