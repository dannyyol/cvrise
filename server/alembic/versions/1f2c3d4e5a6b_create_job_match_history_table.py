"""create job match history table

Revision ID: 1f2c3d4e5a6b
Revises: 2512033fbb61
Create Date: 2026-05-14
"""

from alembic import op
import sqlalchemy as sa


revision = "1f2c3d4e5a6b"
down_revision = "2512033fbb61"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "job_match_history",
        sa.Column("id", sa.String(length=255), primary_key=True),
        sa.Column("user_id", sa.String(length=255), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("resume_id", sa.String(length=255), sa.ForeignKey("resumes.id"), nullable=False),
        sa.Column("job_title", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("job_description", sa.Text(), nullable=False),
        sa.Column("match_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("matched_keywords", sa.JSON(), nullable=True),
        sa.Column("missing_keywords", sa.JSON(), nullable=True),
        sa.Column("suggestions", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_job_match_history_user_id_created_at", "job_match_history", ["user_id", "created_at"])
    op.create_index("ix_job_match_history_resume_id_created_at", "job_match_history", ["resume_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_job_match_history_resume_id_created_at", table_name="job_match_history")
    op.drop_index("ix_job_match_history_user_id_created_at", table_name="job_match_history")
    op.drop_table("job_match_history")
