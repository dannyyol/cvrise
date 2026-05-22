"""settings add id and user_id

Revision ID: 3a7c2f1d9b0c
Revises: 2d9f0a1c3b4e
Create Date: 2026-05-22 00:00:00.000000

"""

from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa


revision: str = "3a7c2f1d9b0c"
down_revision: Union[str, Sequence[str], None] = "2d9f0a1c3b4e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    op.create_table(
        "settings_new",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("key", sa.String(length=128), nullable=False),
        sa.Column("value", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "key", name="uq_settings_user_id_key"),
    )
    op.create_index("ix_settings_user_id_key", "settings_new", ["user_id", "key"], unique=False)

    settings_old = sa.table(
        "settings",
        sa.column("key", sa.String(length=128)),
        sa.column("value", sa.JSON()),
    )
    rows = conn.execute(sa.select(settings_old.c.key, settings_old.c.value)).fetchall()
    if rows:
        settings_new = sa.table(
            "settings_new",
            sa.column("id", sa.String(length=36)),
            sa.column("user_id", sa.String(length=36)),
            sa.column("key", sa.String(length=128)),
            sa.column("value", sa.JSON()),
        )
        conn.execute(
            sa.insert(settings_new),
            [{"id": str(uuid.uuid4()), "user_id": None, "key": r[0], "value": r[1]} for r in rows],
        )

    op.drop_table("settings")
    op.rename_table("settings_new", "settings")


def downgrade() -> None:
    conn = op.get_bind()

    op.create_table(
        "settings_old",
        sa.Column("key", sa.String(length=128), nullable=False),
        sa.Column("value", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )

    settings_new = sa.table(
        "settings",
        sa.column("user_id", sa.String(length=36)),
        sa.column("key", sa.String(length=128)),
        sa.column("value", sa.JSON()),
    )
    rows = conn.execute(
        sa.select(settings_new.c.key, settings_new.c.value).where(settings_new.c.user_id.is_(None))
    ).fetchall()
    if rows:
        settings_old = sa.table(
            "settings_old",
            sa.column("key", sa.String(length=128)),
            sa.column("value", sa.JSON()),
        )
        conn.execute(sa.insert(settings_old), [{"key": r[0], "value": r[1]} for r in rows])

    op.drop_table("settings")
    op.rename_table("settings_old", "settings")
