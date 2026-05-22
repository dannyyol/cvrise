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
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = set(inspector.get_table_names())

    if "pdf_exports" not in tables and "pdf_export_intents" in tables:
        op.rename_table("pdf_export_intents", "pdf_exports")
        tables.discard("pdf_export_intents")
        tables.add("pdf_exports")
        inspector = sa.inspect(conn)

    if "pdf_exports" not in tables:
        op.create_table(
            "pdf_exports",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("template", sa.String(length=64), nullable=False),
            sa.Column("data", sa.JSON(), nullable=False),
            sa.Column("requester_ip", sa.String(length=64), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )
        tables.add("pdf_exports")
        inspector = sa.inspect(conn)

    existing_indexes = {idx.get("name") for idx in inspector.get_indexes("pdf_exports")} if "pdf_exports" in tables else set()

    for old_idx in [
        "ix_pdf_export_intents_expires_at",
        "ix_pdf_export_intents_consumed_at",
        "ix_pdf_export_intents_requester_ip_created_at",
    ]:
        if old_idx in existing_indexes:
            op.drop_index(old_idx, table_name="pdf_exports")
            existing_indexes.discard(old_idx)

    if "ix_pdf_exports_expires_at" not in existing_indexes:
        op.create_index("ix_pdf_exports_expires_at", "pdf_exports", ["expires_at"], unique=False)
    if "ix_pdf_exports_consumed_at" not in existing_indexes:
        op.create_index("ix_pdf_exports_consumed_at", "pdf_exports", ["consumed_at"], unique=False)
    if "ix_pdf_exports_requester_ip_created_at" not in existing_indexes:
        op.create_index(
            "ix_pdf_exports_requester_ip_created_at",
            "pdf_exports",
            ["requester_ip", "created_at"],
            unique=False,
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = set(inspector.get_table_names())

    if "pdf_exports" not in tables:
        return

    existing_indexes = {idx.get("name") for idx in inspector.get_indexes("pdf_exports")}
    for idx in [
        "ix_pdf_exports_requester_ip_created_at",
        "ix_pdf_exports_consumed_at",
        "ix_pdf_exports_expires_at",
    ]:
        if idx in existing_indexes:
            op.drop_index(idx, table_name="pdf_exports")

    op.rename_table("pdf_exports", "pdf_export_intents")

    op.create_index("ix_pdf_export_intents_expires_at", "pdf_export_intents", ["expires_at"], unique=False)
    op.create_index("ix_pdf_export_intents_consumed_at", "pdf_export_intents", ["consumed_at"], unique=False)
    op.create_index(
        "ix_pdf_export_intents_requester_ip_created_at",
        "pdf_export_intents",
        ["requester_ip", "created_at"],
        unique=False,
    )
