from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.resume import Resume, ThemeConfig, Template, CoverLetterThemeConfig
from src.seeders.base import BaseSeeder
import logging
import uuid

logger = logging.getLogger(__name__)

class ResumeSeeder(BaseSeeder):
    async def run(self, session: AsyncSession, user_id: str | None = None, commit: bool = True) -> None:
        if not user_id:
            logger.info("Skipping resume seeding (no user_id).")
            return

        stmt = select(Resume).where(Resume.user_id == user_id).limit(1)
        result = await session.execute(stmt)
        existing_resume = result.scalar_one_or_none()

        if existing_resume:
            logger.info(f"Resume for {user_id} already exists. Skipping.")
            return

        stmt = select(Template).where(Template.key == "classic")
        result = await session.execute(stmt)
        template = result.scalar_one_or_none()
        
        if not template:
            logger.error("Classic template not found. Cannot seed resume.")
            raise RuntimeError("Missing required template: classic")

        logger.info(f"Creating default resume for {user_id}...")

        resume_id = str(uuid.uuid4())
        resume = Resume(
            id=resume_id,
            title="My Resume",
            user_id=user_id,
            template_id=template.id
        )
        session.add(resume)

        theme = ThemeConfig(
            id=str(uuid.uuid4()),
            resume_id=resume_id,
            primary_color='#475569',
            secondary_color='#4b5563',
            font_family=''
        )
        session.add(theme)

        cl_theme = CoverLetterThemeConfig(
            id=str(uuid.uuid4()),
            resume_id=resume_id,
            primary_color='#475569',
            secondary_color='#4b5563',
            font_family='',
            template_key='professional'
        )
        session.add(cl_theme)

        if commit:
            await session.commit()
        else:
            await session.flush()
