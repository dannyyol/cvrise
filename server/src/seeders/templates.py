from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.resume import Template
from src.seeders.base import BaseSeeder
import logging

logger = logging.getLogger(__name__)

class TemplateSeeder(BaseSeeder):
    async def run(self, session: AsyncSession) -> None:
        templates = [
            {
                'key': 'classic',
                'name': 'Classic',
                'description': '',
                'thumbnail': '/thumbnails/classic.png',
                'supports_accent': False,
            },
            {
                'key': 'legacy',
                'name': 'Legacy',
                'description': 'Clean and contemporary design',
                'thumbnail': '/thumbnails/legacy.png',
                'supports_accent': True,
            },
            {
                'key': 'professional',
                'name': 'Professional',
                'description': 'Bold and executive appearance',
                'thumbnail': '/thumbnails/professional.png',
                'supports_accent': True,
            },
            {
                'key': 'elegant',
                'name': 'Elegant',
                'description': 'Sophisticated two-column design',
                'thumbnail': '/thumbnails/elegant.png',
                'supports_accent': True,
                'sidebar_section_keys': ['personal', 'skills', 'languages', 'websites', 'interests', 'references'],
            },
            {
                'key': 'regal',
                'name': 'Regal',
                'description': 'Refined single-column with centered headings',
                'thumbnail': '/thumbnails/regal.png',
                'supports_accent': True,
            },
            {
                'key': 'heritage',
                'name': 'Heritage',
                'description': 'Two-column layout with sidebar and header banner',
                'thumbnail': '/thumbnails/heritage.png',
                'supports_accent': True,
                'sidebar_section_keys': ['personal', 'websites', 'skills'],
            },
            {
                'key': 'chronicle',
                'name': 'chronicle',
                'description': '',
                'thumbnail': '/thumbnails/chronicle.png',
                'supports_accent': True,
                'sidebar_section_keys': ['skills', 'languages', 'interests', 'websites', 'awards', 'certifications'],
            },
            {
                'key': 'timeline',
                'name': 'Timeline',
                'description': '',
                'thumbnail': '/thumbnails/timeline.png',
                'supports_accent': True,
                'sidebar_section_keys': ['skills', 'languages', 'interests', 'websites', 'awards', 'certifications'],
            },
        ]

        for template_data in templates:
            stmt = select(Template).where(Template.key == template_data['key'])
            result = await session.execute(stmt)
            existing_template = result.scalar_one_or_none()

            if existing_template:
                logger.info(f"Updating template: {template_data['name']}")
                for key, value in template_data.items():
                    setattr(existing_template, key, value)
            else:
                logger.info(f"Creating template: {template_data['name']}")
                new_template = Template(**template_data)
                session.add(new_template)
        
        await session.commit()
