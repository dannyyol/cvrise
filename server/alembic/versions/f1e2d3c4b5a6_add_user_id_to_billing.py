"""add_user_id_to_billing

Revision ID: f1e2d3c4b5a6
Revises: ebaab0b4f6d2
Create Date: 2026-02-07 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1e2d3c4b5a6'
down_revision: Union[str, Sequence[str], None] = 'ebaab0b4f6d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add user_id column to user_balances
    with op.batch_alter_table('user_balances', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.String(), nullable=True))
        batch_op.create_foreign_key('fk_user_balances_users', 'users', ['user_id'], ['id'])

    # Add user_id column to token_transactions
    with op.batch_alter_table('token_transactions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.String(), nullable=True))
        batch_op.create_foreign_key('fk_token_transactions_users', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    # Remove user_id column from token_transactions
    with op.batch_alter_table('token_transactions', schema=None) as batch_op:
        batch_op.drop_constraint('fk_token_transactions_users', type_='foreignkey')
        batch_op.drop_column('user_id')

    # Remove user_id column from user_balances
    with op.batch_alter_table('user_balances', schema=None) as batch_op:
        batch_op.drop_constraint('fk_user_balances_users', type_='foreignkey')
        batch_op.drop_column('user_id')
