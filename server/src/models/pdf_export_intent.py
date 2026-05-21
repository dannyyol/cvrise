import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, JSON, String, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from src.database import Base


class PdfExportIntent(Base):
    __tablename__ = "pdf_export_intents"
    __table_args__ = (
        Index("ix_pdf_export_intents_expires_at", "expires_at"),
        Index("ix_pdf_export_intents_consumed_at", "consumed_at"),
        Index("ix_pdf_export_intents_requester_ip_created_at", "requester_ip", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(length=36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template: Mapped[str] = mapped_column(String(length=64), nullable=False)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)

    requester_ip: Mapped[Optional[str]] = mapped_column(String(length=64), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    consumed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
