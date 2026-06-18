"""add resume share links

Revision ID: 6b8f9c2d1e3a
Revises: 1f2c3d4e5a6b, 4c6a9d2f1b7e
Create Date: 2026-06-14
"""

from alembic import op
import sqlalchemy as sa


revision = "6b8f9c2d1e3a"
down_revision = ("1f2c3d4e5a6b", "4c6a9d2f1b7e")
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("resumes", sa.Column("share_token", sa.String(length=12), nullable=True))
    op.add_column(
        "resumes",
        sa.Column("share_view_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column("resumes", sa.Column("share_created_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("resumes", sa.Column("share_last_viewed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("resumes", sa.Column("share_revoked_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_resumes_share_token", "resumes", ["share_token"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_resumes_share_token", table_name="resumes")
    op.drop_column("resumes", "share_revoked_at")
    op.drop_column("resumes", "share_last_viewed_at")
    op.drop_column("resumes", "share_created_at")
    op.drop_column("resumes", "share_view_count")
    op.drop_column("resumes", "share_token")
