from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base

class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    value: Mapped[dict] = mapped_column(JSON)
