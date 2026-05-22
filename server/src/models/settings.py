import uuid

from sqlalchemy import String, JSON, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base

class Setting(Base):
    __tablename__ = "settings"

    __table_args__ = (
        UniqueConstraint("user_id", "key", name="uq_settings_user_id_key"),
        Index("ix_settings_user_id_key", "user_id", "key"),
    )

    id: Mapped[str] = mapped_column(String(length=36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    key: Mapped[str] = mapped_column(String(length=128), nullable=False)
    value: Mapped[dict] = mapped_column(JSON, nullable=False)
