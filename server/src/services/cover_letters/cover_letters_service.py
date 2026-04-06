from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from loguru import logger
import uuid
from typing import Optional, List, Tuple

from src.models.resume import Resume
from src.models.cover_letter import CoverLetter as DBCoverLetter
from src.models.settings import Setting
from src.models.ai_model import AIModel
from src.api.schemas.resume import CoverLetterItem, CoverLetterCreate, CoverLetterGenerateRequest
from src.models.cover_letter_template import CoverLetterTemplate
from src.services.ai.ai_clients import TextProcessor, OpenAIClient, AnthropicClient, GoogleClient, OllamaClient
from src.services.ai.ai_connection import AIConnectionService
from src.services.settings.ai_service import get_configured_ai_client
from src.services.settings.plan_service import PlanService
from src.config import settings
from src.models.user import User

class CoverLetterService:
    def __init__(self, db: AsyncSession, user: Optional[User] = None):
        self.db = db
        self.user = user

    @property
    def user_id(self) -> str:
        return self.user.id if self.user else "default-user"

    async def _get_ai_config(self) -> Tuple[AIModel, dict]:
        stmt = select(Setting).where(Setting.key == "ai_config")
        result = await self.db.execute(stmt)
        setting = result.scalar_one_or_none()
        ai_settings = setting.value if setting else {}
        active_model_id = ai_settings.get("activeModelId")
        if not active_model_id:
            raise HTTPException(status_code=400, detail="No active AI model selected. Please configure an AI model in Settings.")
        stmt = select(AIModel).where(AIModel.id == active_model_id)
        result = await self.db.execute(stmt)
        active_model = result.scalar_one_or_none()
        if not active_model:
            raise HTTPException(status_code=400, detail="Invalid Active Model ID")
        return active_model, ai_settings

    def _compose_resume_text(self, resume: Resume) -> str:
        rd = resume.resume_data or {}
        sections = {}
        
        # Summary
        summ_content = rd.get("professionalSummary", {}).get("content", "")
        if summ_content:
            sections["Summary"] = summ_content
            
        # Experience
        exps = rd.get("workExperiences", [])
        if exps:
            parts = []
            for item in exps:
                title = item.get("position", "")
                company = item.get("company", "")
                location = item.get("location", "")
                start = item.get("startDate", "")
                current = item.get("current", False)
                end = "Present" if current else item.get("endDate", "")
                header = ", ".join([p for p in [title, company] if p])
                tail = " — ".join([p for p in [location, f"{start}–{end}".strip('–')] if p])
                line1 = " — ".join([p for p in [header, tail] if p]).strip()
                desc = item.get("description", "")
                parts.append("\n".join([p for p in [line1, desc] if p]).strip())
            sections["Experience"] = "\n\n".join([p for p in parts if p])

        # Education
        edus = rd.get("education", [])
        if edus:
            parts = []
            for item in edus:
                degree = item.get("degree", "")
                field = item.get("fieldOfStudy", "")
                inst = item.get("institution", "")
                start = item.get("startDate", "")
                end = item.get("endDate", "")
                line = ", ".join([p for p in [degree, field] if p])
                tail = " — ".join([p for p in [inst, f"{start}–{end}".strip('–')] if p])
                parts.append(" ".join([line, tail]).strip())
            sections["Education"] = "\n\n".join([p for p in parts if p])

        # Skills
        skills = rd.get("skills", [])
        if skills:
            skill_parts = []
            for item in skills:
                name = item.get("name", "")
                level = item.get("level", "")
                skill_parts.append(name + (f" ({level})" if level else ""))
            sections["Skills"] = ", ".join([p for p in skill_parts if p])

        # Projects
        projs = rd.get("projects", [])
        if projs:
            parts = []
            for item in projs:
                title = item.get("name", "")
                desc = item.get("description", "")
                start = item.get("startDate", "")
                end = item.get("endDate", "")
                url = item.get("link", "")
                line = " — ".join([p for p in [title, desc] if p])
                tail = " ".join([p for p in [f"({start}–{end})".strip('()–'), url] if p])
                parts.append("\n".join([p for p in [line, tail] if p]).strip())
            sections["Projects"] = "\n\n".join([p for p in parts if p])

        # Certifications
        certs = rd.get("certifications", [])
        if certs:
            parts = []
            for item in certs:
                name = item.get("name", "")
                issuer = item.get("issuer", "")
                issue_date = item.get("issueDate", "")
                expiry_date = item.get("expiryDate", "")
                line = " — ".join([p for p in [name, issuer] if p])
                tail = f"{issue_date}–{expiry_date}".strip("–")
                parts.append("\n".join([p for p in [line, tail] if p]).strip())
            sections["Certifications"] = "\n\n".join([p for p in parts if p])

        # Publications
        pubs = rd.get("publications", [])
        if pubs:
            parts = []
            for item in pubs:
                title = item.get("title", "")
                publisher = item.get("publisher", "")
                year = item.get("date", "")
                url = (item.get("link", "")).replace("`", "").strip()
                line = " — ".join([p for p in [title, publisher] if p])
                tail = " ".join([p for p in [f"({year})".strip('()'), url] if p])
                parts.append("\n".join([p for p in [line, tail] if p]).strip())
            sections["Publications"] = "\n\n".join([p for p in parts if p])

        # Awards
        awards = rd.get("awards", [])
        if awards:
            parts = []
            for item in awards:
                title = item.get("title", "")
                issuer = item.get("issuer", "")
                year = item.get("date", "")
                description = item.get("description", "")
                line = " — ".join([p for p in [title, issuer] if p])
                tail = " ".join([p for p in [year, description] if p])
                parts.append("\n".join([p for p in [line, tail] if p]).strip())
            sections["Awards"] = "\n\n".join([p for p in parts if p])
        
        # Languages
        langs = rd.get("languages", [])
        if langs:
            parts = []
            for item in langs:
                language = item.get("name", "")
                proficiency = item.get("description", "")
                entry = " — ".join([p for p in [language, proficiency] if p]).strip()
                if entry:
                    parts.append(entry)
            sections["Languages"] = ", ".join([p for p in parts if p])

        order = ["Summary", "Experience", "Education", "Skills", "Projects", "Certifications", "Publications", "Awards", "Languages"]
        lines = []
        for name in order:
            content = sections.get(name, "").strip()
            if content:
                lines.append(f"{name}\n{content}")
        for name, content in sections.items():
            if name not in order and content.strip():
                lines.append(f"{name}\n{content.strip()}")
        return "\n\n".join(lines).strip()

    def _compose_cover_letter_prompt(self, resume_text: str, body: CoverLetterGenerateRequest, guidelines: dict, length_hint: str) -> str:
        opening = guidelines.get("opening", "")
        closing = guidelines.get("closing", "")
        structure = guidelines.get("structure", "")
        word_count = guidelines.get("word_count", "")
        style_tips = guidelines.get("style_tips", [])
        tips = "\n".join([f"- {t}" for t in style_tips]) if style_tips else ""
        
        instruction = "Write a tailored cover letter using the resume and job context."
        resume_section = f"Resume:\n\"\"\"\n{resume_text}\n\"\"\"\n\n"
        
        if not resume_text or not resume_text.strip():
            instruction = "Write a cover letter based on the job description. Since no resume is provided, assume the candidate has relevant skills and experience matching the job requirements. Leave placeholders for candidate-specific details where necessary."
            resume_section = ""

        return (
            f"{instruction}\n\n"
            "Return plain text only.\n\n"
            f"Tone: {body.tone}\n"
            f"Desired length: {length_hint}\n"
            f"Company: {body.company_name}\n"
            f"Recipient: {body.recipient_title} {body.recipient_name}\n"
            f"Role: {body.job_title}\n"
            "Job Description:\n"
            f"\"\"\"\n{body.job_description}\n\"\"\"\n\n"
            f"{resume_section}"
            "Template Guidelines:\n"
            f"- Opening: {opening}\n"
            f"- Closing: {closing}\n"
            f"- Structure: {structure}\n"
            f"- Target word count: {word_count}\n"
            f"{tips}\n"
        )

    async def list_cover_letters(self, resume_id: str) -> List[CoverLetterItem]:
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id
        ).options(selectinload(Resume.cover_letters))
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        items = []
        for cl in resume.cover_letters:
            items.append(
                CoverLetterItem(
                    id=cl.id,
                    title=cl.name or f"{cl.job_title} @ {cl.company_name}".strip(),
                    recipient_name=cl.recipient_name,
                    recipient_title=cl.recipient_title,
                    company_name=cl.company_name,
                    company_address=cl.company_address,
                    content=cl.content,
                    job_title=cl.job_title,
                    job_description=cl.job_description,
                    template_key=cl.template_key,
                    tone=cl.tone,
                    length=cl.length,
                    created_at=cl.created_at.isoformat() if cl.created_at else None,
                    updated_at=cl.updated_at.isoformat() if cl.updated_at else None,
                )
            )
        items.sort(key=lambda x: x.updated_at or x.created_at or "", reverse=True)
        return items

    async def create_cover_letter(self, resume_id: str, body: CoverLetterCreate) -> CoverLetterItem:
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        name = body.title or (f"{body.job_title} @ {body.company_name}".strip() if body.job_title or body.company_name else "Cover Letter")
        cl = DBCoverLetter(
            id=str(uuid.uuid4()),
            resume_id=resume.id,
            name=name,
            recipient_name=body.recipient_name or "",
            recipient_title=body.recipient_title or "",
            company_name=body.company_name or "",
            company_address=body.company_address or "",
            content=body.content or "",
            job_title=body.job_title or "",
            job_description=body.job_description or "",
            template_key=body.template_key or "soft-modern",
            tone=body.tone or "professional",
            length=body.length or "medium",
        )
        self.db.add(cl)
        resume.updated_at = datetime.utcnow()
        await self.db.commit()
        return CoverLetterItem(
            id=cl.id,
            title=cl.name,
            recipient_name=cl.recipient_name,
            recipient_title=cl.recipient_title,
            company_name=cl.company_name,
            company_address=cl.company_address,
            content=cl.content,
            job_title=cl.job_title,
            job_description=cl.job_description,
            template_key=cl.template_key,
            tone=cl.tone,
            length=cl.length,
            created_at=cl.created_at.isoformat() if cl.created_at else None,
            updated_at=cl.updated_at.isoformat() if cl.updated_at else None,
        )

    async def generate_cover_letter(self, resume_id: str, body: CoverLetterGenerateRequest) -> CoverLetterItem:
        try:
            stmt = select(Resume).where(
                Resume.id == resume_id,
                Resume.user_id == self.user_id
            )
            # Trigger reload and ensure clean query
            result = await self.db.execute(stmt)
            resume = result.scalar_one_or_none()
            if not resume:
                raise HTTPException(status_code=404, detail="Resume not found")
            client, model_id, is_platform_mode = await get_configured_ai_client(self.db)
            plan_service = PlanService(self.db, self.user)
            cost = settings.COST_GENERATE_COVER_LETTER
            if is_platform_mode:
                if not await plan_service.has_sufficient_balance(cost):
                     raise HTTPException(status_code=402, detail=f"Insufficient tokens. This action requires at least {cost} tokens.")
            stmt_t = select(CoverLetterTemplate).where(CoverLetterTemplate.key == body.template_key)
            res_t = await self.db.execute(stmt_t)
            template = res_t.scalar_one_or_none()
            if not template:
                raise HTTPException(status_code=400, detail="Invalid cover letter template key")
            resume_text = self._compose_resume_text(resume)
            length_hint = body.length or "medium"
            prompt = self._compose_cover_letter_prompt(resume_text, body, template.guidelines or {}, length_hint)
            generated = await client.generate(prompt, model_id)
            content = TextProcessor.strip_code_fences(generated)
            name = body.title or (f"{body.job_title} @ {body.company_name}".strip() if body.job_title or body.company_name else "Cover Letter")
            cl = DBCoverLetter(
                id=str(uuid.uuid4()),
                resume_id=resume.id,
                name=name,
                recipient_name=body.recipient_name or "",
                recipient_title=body.recipient_title or "",
                company_name=body.company_name or "",
                company_address=body.company_address or "",
                content=content or "",
                job_title=body.job_title or "",
                job_description=body.job_description or "",
                template_key=body.template_key or template.key,
                tone=body.tone or "professional",
                length=length_hint or "medium",
            )
            self.db.add(cl)
            resume.updated_at = datetime.utcnow()
            if is_platform_mode:
                await plan_service.deduct_tokens(cost, "Cover Letter Generation")
            await self.db.commit()
            return CoverLetterItem(
                id=cl.id,
                title=cl.name,
                recipient_name=cl.recipient_name,
                recipient_title=cl.recipient_title,
                company_name=cl.company_name,
                company_address=cl.company_address,
                content=cl.content,
                job_title=cl.job_title,
                job_description=cl.job_description,
                template_key=cl.template_key,
                tone=cl.tone,
                length=cl.length,
                created_at=cl.created_at.isoformat() if cl.created_at else None,
                updated_at=cl.updated_at.isoformat() if cl.updated_at else None,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Cover letter generation failed: {}", e)
            raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
