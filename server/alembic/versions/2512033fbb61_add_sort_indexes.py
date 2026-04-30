"""add sort indexes

Revision ID: 2512033fbb61
Revises: ebaab0b4f6d2
Create Date: 2026-04-30 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op

revision: str = '2512033fbb61'
down_revision: Union[str, Sequence[str], None] = 'ebaab0b4f6d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index('ix_resumes_user_id_updated_at', 'resumes', ['user_id', 'updated_at'])
    op.create_index('ix_token_transactions_user_id_created_at', 'token_transactions', ['user_id', 'created_at'])


def downgrade() -> None:
    op.drop_index('ix_token_transactions_user_id_created_at', table_name='token_transactions')
    op.drop_index('ix_resumes_user_id_updated_at', table_name='resumes')
