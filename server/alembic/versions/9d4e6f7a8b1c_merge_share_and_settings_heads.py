"""merge share and settings heads

Revision ID: 9d4e6f7a8b1c
Revises: 3a7c2f1d9b0c, 6b8f9c2d1e3a
Create Date: 2026-06-15 00:00:00.000000
"""

from typing import Sequence, Union


revision: str = "9d4e6f7a8b1c"
down_revision: Union[str, Sequence[str], None] = ("3a7c2f1d9b0c", "6b8f9c2d1e3a")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
