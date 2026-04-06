from sqlalchemy import String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base
import uuid

class CoverLetterTemplate(Base):
    __tablename__ = "cover_letter_templates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    key: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, default="")
    guidelines: Mapped[dict] = mapped_column(JSON, default=dict)
