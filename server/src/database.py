from functools import lru_cache
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from src.config import get_settings

@lru_cache
def get_engine():
    settings = get_settings()
    return create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
    )

@lru_cache
def get_sessionmaker():
    return async_sessionmaker(
        bind=get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
    )

class Base(DeclarativeBase):
    pass

async def get_db():
    async with get_sessionmaker()() as session:
        yield session

async def init_db():
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)