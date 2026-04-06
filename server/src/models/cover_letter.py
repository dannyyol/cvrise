from typing import Optional
import uuid
from sqlalchemy import String, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from src.database import Base

class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id: Mapped[str] = mapped_column(ForeignKey("resumes.id"))
    name: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[Optional["DateTime"]] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional["DateTime"]] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    recipient_name: Mapped[str] = mapped_column(String, default="")
    recipient_title: Mapped[str] = mapped_column(String, default="")
    company_name: Mapped[str] = mapped_column(String, default="")
    company_address: Mapped[str] = mapped_column(String, default="")
    content: Mapped[str] = mapped_column(Text, default="")
    
    job_title: Mapped[str] = mapped_column(String, default="")
    job_description: Mapped[str] = mapped_column(Text, default="")
    template_key: Mapped[str] = mapped_column(String, default="soft-modern")
    tone: Mapped[str] = mapped_column(String, default="professional")
    length: Mapped[str] = mapped_column(String, default="medium")
    
    resume: Mapped["Resume"] = relationship("Resume", back_populates="cover_letters")
