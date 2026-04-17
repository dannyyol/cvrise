from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.cover_letter_template import CoverLetterTemplate
from src.seeders.base import BaseSeeder
import logging

logger = logging.getLogger(__name__)

class CoverLetterTemplateSeeder(BaseSeeder):
    async def run(self, session: AsyncSession) -> None:
        templates = [
            {
                'key': 'mono',
                'name': 'Mono',
                'description': 'Clean, monospaced typography for a technical look.',
                'guidelines': {
                    'opening': 'Dear [Title] [Name],',
                    'closing': 'Sincerely,',
                    'structure': '3-4 paragraphs: opening, body, closing',
                    'word_count': '350-500',
                    'style_tips': ['clear structure', 'technical focus', 'precise language']
                }
            },
            {
                'key': 'aesthetic',
                'name': 'Aesthetic',
                'description': 'Elegant and refined with attention to visual balance.',
                'guidelines': {
                    'opening': 'Dear [Title] [Name],',
                    'closing': 'Best regards,',
                    'structure': '3 paragraphs: hook, highlights, closing',
                    'word_count': '300-400',
                    'style_tips': ['engaging narrative', 'personal touch', 'smooth flow']
                }
            },
            {
                'key': 'soft-modern',
                'name': 'Soft Modern',
                'description': 'Contemporary design with approachable typography.',
                'guidelines': {
                    'opening': 'Hello [Title] [Name],',
                    'closing': 'Best,',
                    'structure': '3-4 paragraphs',
                    'word_count': '300-450',
                    'style_tips': ['conversational yet professional', 'highlight soft skills', 'clear value prop']
                }
            },
            {
                'key': 'silhouette',
                'name': 'Silhouette',
                'description': 'Bold and impactful with strong visual hierarchy.',
                'guidelines': {
                    'opening': 'Dear [Title] [Name],',
                    'closing': 'Sincerely,',
                    'structure': '4 paragraphs: strong hook, achievements, fit, call to action',
                    'word_count': '400-600',
                    'style_tips': ['action verbs', 'confident tone', 'results-oriented']
                }
            },
        ]
        
        for data in templates:
            stmt = select(CoverLetterTemplate).where(CoverLetterTemplate.key == data['key'])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if existing:
                logger.info(f"Updating cover letter template: {data['name']}")
                for k, v in data.items():
                    setattr(existing, k, v)
            else:
                logger.info(f"Creating cover letter template: {data['name']}")
                session.add(CoverLetterTemplate(**data))
        await session.commit()
