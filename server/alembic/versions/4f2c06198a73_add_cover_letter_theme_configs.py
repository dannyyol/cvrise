from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '4f2c06198a73'
down_revision: Union[str, Sequence[str], None] = 'f7a1c8d9ab12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'cover_letter_theme_configs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('resume_id', sa.String(length=36), nullable=False),
        sa.Column('primary_color', sa.String(length=32), nullable=False),
        sa.Column('secondary_color', sa.String(length=32), nullable=False),
        sa.Column('font_family', sa.String(length=128), nullable=False),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('cover_letter_theme_configs')
