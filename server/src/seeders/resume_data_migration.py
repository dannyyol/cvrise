
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.resume import Resume
from src.constants import DEFAULT_RESUME_SECTIONS
from src.seeders.base import BaseSeeder
import logging
import uuid

logger = logging.getLogger(__name__)

class ResumeDataMigrationSeeder(BaseSeeder):
    async def run(self, session: AsyncSession, user_id: str | None = None, commit: bool = True) -> None:
        if not user_id:
            logger.info("Skipping resume_data migration seeding (no user_id).")
            return

        stmt = select(Resume).where(Resume.user_id == user_id).order_by(Resume.updated_at.desc()).limit(1)
        result = await session.execute(stmt)
        resume = result.scalar_one_or_none()

        if not resume:
            logger.warning(f"Resume for {user_id} not found. Skipping resume_data migration.")
            return

        if resume.resume_data:
            logger.info(f"Resume data for {user_id} already exists. Skipping.")
            return

        logger.info(f"Seeding resume_data column for {user_id} resume...")

        resume_data = {
            "personalDetails": {
                "fullName": "",
                "email": "",
                "phone": "",
                "address": "",
                "jobTitle": "",
                "website": "",
                "linkedin": "",
                "github": ""
            },
            "professionalSummary": {
                "content": ""
            },
            "workExperiences": [],
            "education": [],
            "skills": [],
            "sections": DEFAULT_RESUME_SECTIONS,
            "languages": [],
            "interests": [],
            "websites": [],
            "volunteering": [],
            "references": [],
            "custom": []
        }

        resume.resume_data = resume_data
        if commit:
            await session.commit()
        else:
            await session.flush()
        logger.info("Resume data migration completed successfully.")
