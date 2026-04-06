from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession

class BaseSeeder(ABC):
    @abstractmethod
    async def run(self, session: AsyncSession) -> None:
        """Run the seeder logic."""
        pass
