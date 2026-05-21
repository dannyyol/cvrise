"""create_pdf_export_intents_table

Revision ID: 2d9f0a1c3b4e
Revises: ab12cd34ef56
Create Date: 2026-05-20 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2d9f0a1c3b4e"
down_revision: Union[str, Sequence[str], None] = "ab12cd34ef56"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "pdf_export_intents",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("template", sa.String(length=64), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.Column("requester_ip", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_pdf_export_intents_expires_at", "pdf_export_intents", ["expires_at"], unique=False)
    op.create_index("ix_pdf_export_intents_consumed_at", "pdf_export_intents", ["consumed_at"], unique=False)
    op.create_index(
        "ix_pdf_export_intents_requester_ip_created_at",
        "pdf_export_intents",
        ["requester_ip", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_pdf_export_intents_requester_ip_created_at", table_name="pdf_export_intents")
    op.drop_index("ix_pdf_export_intents_consumed_at", table_name="pdf_export_intents")
    op.drop_index("ix_pdf_export_intents_expires_at", table_name="pdf_export_intents")
    op.drop_table("pdf_export_intents")
