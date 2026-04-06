from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '7c1b8a9f2e31'
down_revision: Union[str, Sequence[str], None] = '4f2c06198a73'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column(
        'cover_letter_theme_configs',
        sa.Column('template_key', sa.String(), nullable=False, server_default='professional')
    )

def downgrade() -> None:
    op.drop_column('cover_letter_theme_configs', 'template_key')
