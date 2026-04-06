from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base

class AIModel(Base):
    __tablename__ = "ai_models"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    provider: Mapped[str] = mapped_column(String)
    key_id: Mapped[str] = mapped_column(String)  # 'google', 'openai', 'anthropic', 'ollama'
