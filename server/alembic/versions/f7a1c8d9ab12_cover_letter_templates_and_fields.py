from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f7a1c8d9ab12'
down_revision: Union[str, Sequence[str], None] = 'c8d131fdaf0b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'cover_letter_templates',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('key', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('default_tone', sa.String(), nullable=False),
        sa.Column('default_length', sa.String(), nullable=False),
        sa.Column('guidelines', sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key')
    )
    with op.batch_alter_table('cover_letters', schema=None) as batch_op:
        batch_op.add_column(sa.Column('template_key', sa.String(), nullable=False, server_default='professional'))
        batch_op.add_column(sa.Column('tone', sa.String(), nullable=False, server_default='professional'))
        batch_op.add_column(sa.Column('length', sa.String(), nullable=False, server_default='medium'))

def downgrade() -> None:
    with op.batch_alter_table('cover_letters', schema=None) as batch_op:
        batch_op.drop_column('length')
        batch_op.drop_column('tone')
        batch_op.drop_column('template_key')
    op.drop_table('cover_letter_templates')
