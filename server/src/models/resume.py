from typing import List, Optional
from datetime import datetime
import uuid
from sqlalchemy import String, Boolean, ForeignKey, DateTime, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from src.database import Base

class Resume(Base):
    __tablename__ = "resumes"
    __table_args__ = (
        Index("ix_resumes_user_id_updated_at", "user_id", "updated_at"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, default="My Resume")
    user_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    template_id: Mapped[str] = mapped_column(ForeignKey("templates.id"))
    create_and_tailor: Mapped[bool] = mapped_column(Boolean, default=False)
    resume_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ai_analysis: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    template: Mapped["Template"] = relationship("Template", back_populates="resumes")
    theme: Mapped[Optional["ThemeConfig"]] = relationship("ThemeConfig", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    cover_letter_theme: Mapped[Optional["CoverLetterThemeConfig"]] = relationship("CoverLetterThemeConfig", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    cover_letters: Mapped[List["CoverLetter"]] = relationship("CoverLetter", back_populates="resume", cascade="all, delete-orphan")

    @property
    def template_key(self):
        return self.template.key if self.template else "classic"

class Template(Base):
    __tablename__ = "templates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    key: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    thumbnail: Mapped[str] = mapped_column(String)
    supports_accent: Mapped[bool] = mapped_column(Boolean, default=False)
    sidebar_section_keys: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)

    resumes: Mapped[List["Resume"]] = relationship("Resume", back_populates="template")

class ThemeConfig(Base):
    __tablename__ = "theme_configs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    resume_id: Mapped[str] = mapped_column(ForeignKey("resumes.id"))
    primary_color: Mapped[str] = mapped_column(String, default="#000000")
    secondary_color: Mapped[str] = mapped_column(String, default="#666666")
    font_family: Mapped[str] = mapped_column(String, default="Inter")

    resume: Mapped["Resume"] = relationship("Resume", back_populates="theme")

class CoverLetterThemeConfig(Base):
    __tablename__ = "cover_letter_theme_configs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    resume_id: Mapped[str] = mapped_column(ForeignKey("resumes.id"))
    primary_color: Mapped[str] = mapped_column(String, default="#475569")
    secondary_color: Mapped[str] = mapped_column(String, default="#4b5563")
    font_family: Mapped[str] = mapped_column(String, default="")
    template_key: Mapped[str] = mapped_column(String, default="soft-modern")

    resume: Mapped["Resume"] = relationship("Resume", back_populates="cover_letter_theme")
