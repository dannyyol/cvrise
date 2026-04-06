from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.resume import Resume, ThemeConfig, Template, CoverLetterThemeConfig
from src.seeders.base import BaseSeeder
import logging
import uuid

logger = logging.getLogger(__name__)

class ResumeSeeder(BaseSeeder):
    async def run(self, session: AsyncSession, user_id: str = "default-user") -> None:
        # Check if default resume exists
        stmt = select(Resume).where(Resume.user_id == user_id)
        result = await session.execute(stmt)
        existing_resume = result.scalar_one_or_none()

        if existing_resume:
            logger.info(f"Resume for {user_id} already exists. Skipping.")
            return

        # Get classic template id
        stmt = select(Template).where(Template.key == "classic")
        result = await session.execute(stmt)
        template = result.scalar_one_or_none()
        
        if not template:
            logger.info("Classic template not found. Running TemplateSeeder...")
            from src.seeders.templates import TemplateSeeder
            await TemplateSeeder().run(session)
            
            # Try again
            stmt = select(Template).where(Template.key == "classic")
            result = await session.execute(stmt)
            template = result.scalar_one_or_none()
            
            if not template:
                logger.error("Classic template still not found after seeding. Cannot seed resume.")
                return

        logger.info(f"Creating default resume for {user_id}...")

        # Create Resume
        resume_id = str(uuid.uuid4())
        resume = Resume(
            id=resume_id,
            title="My Resume",
            user_id=user_id,
            template_id=template.id
        )
        session.add(resume)

        # Create Theme
        theme = ThemeConfig(
            id=str(uuid.uuid4()),
            resume_id=resume_id,
            primary_color='#475569',
            secondary_color='#4b5563',
            font_family=''
        )
        session.add(theme)

        # Create Cover Letter Theme
        cl_theme = CoverLetterThemeConfig(
            id=str(uuid.uuid4()),
            resume_id=resume_id,
            primary_color='#475569',
            secondary_color='#4b5563',
            font_family='',
            template_key='professional'
        )
        session.add(cl_theme)

        await session.commit()
