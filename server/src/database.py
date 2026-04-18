from functools import lru_cache

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from src.config import get_settings

@lru_cache(maxsize=1)
def get_engine():
    settings = get_settings()
    return create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    )

class _LazySessionLocal:
    def __init__(self):
        self._maker = None

    def __call__(self, *args, **kwargs):
        if self._maker is None:
            self._maker = async_sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=get_engine(),
                class_=AsyncSession,
                expire_on_commit=False,
            )
        return self._maker(*args, **kwargs)

SessionLocal = _LazySessionLocal()

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
