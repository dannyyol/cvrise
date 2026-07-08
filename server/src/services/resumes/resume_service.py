from datetime import datetime, timezone
import copy
from typing import Optional, List
import secrets
import string
import uuid
from loguru import logger
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified

from src.models.resume import Resume, ThemeConfig, Template, CoverLetterThemeConfig, JobMatchHistory
from src.models.cover_letter import CoverLetter as DBCoverLetter
from src.constants import DEFAULT_RESUME_SECTIONS, RESUME_DATA_FIELD_NAMES
from src.api.schemas.resume import (
    ResumeResponse, ResumeSummary, ResumeUpdate, ResumeCreate,
    TailorResumeRequest, JobMatchRequest, JobMatchResponse,
    JobMatchHistorySummary, JobMatchHistoryItem, ResumeShareLinkResponse,
    PublicResumeResponse,
)
from src.api.schemas.common import PaginatedResponse
from src.services.file_parser_service import FileParser
from src.services.ai.ai_resume_parser_service import AIResumeParser
from src.services.ai.ai_clients_service import (
    TextProcessor, AIConfigurationError, AIProviderError
)
from src.services.settings.ai_service import get_configured_ai_client
from src.services.settings.plan_service import PlanService
from src.utils.pagination import paginate
from src.config import settings
from src.utils.html_sanitizer import sanitize_rich_text_html, sanitize_resume_data_inplace

from src.models.user import User
from src.services.resumes.job_match_service import JobMatchService

class ResumeService:
    def __init__(self, db: AsyncSession, user: Optional[User] = None):
        self.db = db
        self.user = user

    @property
    def user_id(self) -> str:
        return self.user.id

    def _default_theme_payload(self) -> dict:
        return {
            "primary_color": "#475569",
            "secondary_color": "#4b5563",
            "font_family": "",
            "font_size": "medium",
            "letter_spacing": "normal",
            "line_spacing": "normal",
            "date_locale": "en-US",
        }

    def _default_cover_letter_theme_payload(self) -> dict:
        return {
            "primary_color": "#475569",
            "secondary_color": "#4b5563",
            "font_family": "",
            "font_size": "medium",
            "letter_spacing": "normal",
            "line_spacing": "normal",
            "template_key": "soft-modern",
            "date_locale": "en-US",
        }

    def _build_share_url(self, token: str) -> str:
        return f"{settings.CLIENT_BASE_URL.rstrip('/')}/cv/{token}"

    def _build_share_link_response(self, resume: Resume) -> ResumeShareLinkResponse:
        enabled = bool(resume.share_token)
        return ResumeShareLinkResponse(
            enabled=enabled,
            token=resume.share_token,
            url=self._build_share_url(resume.share_token) if resume.share_token else None,
            view_count=resume.share_view_count or 0,
            created_at=resume.share_created_at,
            last_viewed_at=resume.share_last_viewed_at,
            revoked_at=resume.share_revoked_at,
        )

    async def _generate_unique_share_token(self, length: int = 10) -> str:
        alphabet = string.ascii_letters + string.digits
        for _ in range(10):
            token = "".join(secrets.choice(alphabet) for _ in range(length))
            result = await self.db.execute(select(Resume.id).where(Resume.share_token == token))
            if result.scalar_one_or_none() is None:
                return token
        raise HTTPException(status_code=500, detail="Unable to generate a unique share link. Please try again.")

    def _get_safe_resume_data(self, resume: Resume) -> dict:
        rd = resume.resume_data or {}
        safe_rd = copy.deepcopy(rd) if isinstance(rd, dict) else {}
        if isinstance(safe_rd, dict):
            sanitize_resume_data_inplace(safe_rd)
        return safe_rd

    def _get_sections_config(self, safe_rd: dict) -> list:
        sections_config = safe_rd.get("sections", [])
        if not sections_config:
            return DEFAULT_RESUME_SECTIONS
        return sections_config

    def _get_cover_letter_data(self, resume: Resume, safe_rd: dict) -> Optional[dict]:
        cover_letter_data = safe_rd.get("coverLetter")
        if cover_letter_data or not resume.cover_letters:
            return cover_letter_data

        latest = sorted(
            resume.cover_letters,
            key=lambda x: (x.updated_at or x.created_at),
            reverse=True
        )[0]
        return {
            "recipient_name": latest.recipient_name,
            "recipient_title": latest.recipient_title,
            "company_name": latest.company_name,
            "company_address": latest.company_address,
            "content": sanitize_rich_text_html(latest.content),
            "job_title": latest.job_title,
            "job_description": latest.job_description,
            "template_key": latest.template_key,
            "tone": latest.tone,
            "length": latest.length,
        }

    def _serialize_resume(self, resume: Resume) -> ResumeResponse:
        safe_rd = self._get_safe_resume_data(resume)
        sections_config = self._get_sections_config(safe_rd)
        theme_payload = safe_rd.get("theme") or resume.theme or self._default_theme_payload()
        cover_letter_theme_payload = (
            safe_rd.get("coverLetterTheme")
            or resume.cover_letter_theme
            or self._default_cover_letter_theme_payload()
        )
        cover_letter_data = self._get_cover_letter_data(resume, safe_rd)

        return ResumeResponse(
            id=resume.id,
            title=resume.title,
            create_and_tailor=resume.create_and_tailor,
            template_id=resume.template_id,
            template_key=resume.template_key,
            created_at=resume.created_at.isoformat() if resume.created_at else "",
            updated_at=resume.updated_at.isoformat() if resume.updated_at else "",
            resume_data=safe_rd,
            ai_analysis=resume.ai_analysis,
            personal_details=safe_rd.get("personalDetails", {}),
            professional_summary=safe_rd.get("professionalSummary", {}),
            work_experiences=safe_rd.get("workExperiences", []),
            education=safe_rd.get("education", []),
            skills=safe_rd.get("skills", []),
            projects=safe_rd.get("projects", []),
            certifications=safe_rd.get("certifications", []),
            awards=safe_rd.get("awards", []),
            publications=safe_rd.get("publications", []),
            languages=safe_rd.get("languages", []),
            interests=safe_rd.get("interests", []),
            websites=safe_rd.get("websites", []),
            volunteering=safe_rd.get("volunteering", []),
            references=safe_rd.get("references", []),
            custom=safe_rd.get("custom", []),
            sections=sections_config,
            theme=theme_payload,
            cover_letter_theme=cover_letter_theme_payload,
            cover_letter=cover_letter_data,
            share_link=self._build_share_link_response(resume),
        )

    def _serialize_public_resume(self, resume: Resume) -> PublicResumeResponse:
        safe_rd = self._get_safe_resume_data(resume)
        return PublicResumeResponse(
            title=resume.title,
            template_key=resume.template_key,
            personal_details=safe_rd.get("personalDetails", {}),
            professional_summary=safe_rd.get("professionalSummary", {}),
            work_experiences=safe_rd.get("workExperiences", []),
            education=safe_rd.get("education", []),
            skills=safe_rd.get("skills", []),
            projects=safe_rd.get("projects", []),
            certifications=safe_rd.get("certifications", []),
            awards=safe_rd.get("awards", []),
            publications=safe_rd.get("publications", []),
            languages=safe_rd.get("languages", []),
            interests=safe_rd.get("interests", []),
            websites=safe_rd.get("websites", []),
            volunteering=safe_rd.get("volunteering", []),
            references=safe_rd.get("references", []),
            custom=safe_rd.get("custom", []),
            sections=self._get_sections_config(safe_rd),
            theme=safe_rd.get("theme") or resume.theme or self._default_theme_payload(),
        )

    def _compose_resume_text(self, resume: Resume) -> str:
        rd = resume.resume_data or {}
        sections = {}
        
        summ_content = rd.get("professionalSummary", {}).get("content", "")
        if summ_content:
            sections["Summary"] = summ_content
            
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

        skills = rd.get("skills", [])
        if skills:
            skill_parts = []
            for item in skills:
                name = item.get("name", "")
                level = item.get("level", "")
                skill_parts.append(name + (f" ({level})" if level else ""))
            sections["Skills"] = ", ".join([p for p in skill_parts if p])

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

    async def get_resume_by_id(self, resume_id: str) -> ResumeResponse:
        """Fetch a specific resume by ID."""
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id
        ).options(
            selectinload(Resume.template),
            selectinload(Resume.theme),
            selectinload(Resume.cover_letter_theme),
            selectinload(Resume.cover_letters),
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()

        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        if not resume.cover_letter_theme:
            cl_theme = CoverLetterThemeConfig(
                id=str(uuid.uuid4()),
                resume_id=resume.id,
                primary_color='#475569',
                secondary_color='#4b5563',
                font_family=''
            )
            self.db.add(cl_theme)
            await self.db.commit()
            resume.cover_letter_theme = cl_theme
        return self._serialize_resume(resume)

    async def create_resume(self, resume_in: ResumeCreate) -> ResumeResponse:
        """Create a new resume with default sections."""
        resume_id = str(uuid.uuid4())
        
        input_template_id = resume_in.template_id or "classic"
        
        template_id_to_use = input_template_id
        
        stmt = select(Template).where(Template.id == input_template_id)
        result = await self.db.execute(stmt)
        template = result.scalar_one_or_none()
        
        if not template:
            stmt = select(Template).where(Template.key == input_template_id)
            result = await self.db.execute(stmt)
            template = result.scalar_one_or_none()
            
            if template:
                template_id_to_use = template.id
            else:
                stmt = select(Template).where(Template.key == "classic")
                result = await self.db.execute(stmt)
                default_template = result.scalar_one_or_none()
                if default_template:
                    template_id_to_use = default_template.id
                else:
                     logger.warning("Default 'classic' template not found in DB.")
        
        resume = Resume(
            id=resume_id,
            title=resume_in.title or "Untitled Resume",
            user_id=self.user_id,
            template_id=template_id_to_use,
            create_and_tailor=bool(resume_in.create_and_tailor)
        )
        self.db.add(resume)

        theme = ThemeConfig(
            id=str(uuid.uuid4()),
            resume_id=resume_id,
            primary_color='#475569',
            secondary_color='#4b5563',
            font_family=''
        )
        self.db.add(theme)

        cl_theme = CoverLetterThemeConfig(
            id=str(uuid.uuid4()),
            resume_id=resume_id,
            primary_color='#475569',
            secondary_color='#4b5563',
            font_family='',
            template_key='professional'
        )
        self.db.add(cl_theme)

        sections_data = DEFAULT_RESUME_SECTIONS

        resume_data = {
            "sections": sections_data,
            "personalDetails": {
                "fullName": "", "email": "", "phone": "", "address": "",
                "jobTitle": "", "website": "", "linkedin": "", "github": ""
            },
            "professionalSummary": {"content": ""},
            "workExperiences": [],
            "education": [],
            "skills": [],
            "projects": [],
            "certifications": [],
            "awards": [],
            "publications": [],
            "languages": [],
            "interests": [],
            "websites": [],
            "volunteering": [],
            "references": [],
            "custom": [],
            "coverLetter": None
        }
        
        resume.resume_data = resume_data

        await self.db.commit()
        
        return await self.get_resume_by_id(resume_id)

    async def upload_resume(self, file: UploadFile) -> ResumeResponse:
        """
        This method upload a PDF resume, parse it with AI, and create a new resume entry.
        """
        try:
            content = await file.read()
            filename = file.filename.lower() if file.filename else "uploaded_resume.pdf"
            
            if not filename.endswith(".pdf"):
                 raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF.")

            text = FileParser.extract_text_from_pdf(content)
            parsed_data = None
            
            try:
                client, model_id, is_platform_mode = await get_configured_ai_client(self.db, self.user_id)
                
                plan_service = PlanService(self.db, self.user)
                cost = settings.COST_PARSE_RESUME
                
                if is_platform_mode:
                    if not await plan_service.has_sufficient_balance(cost):
                        raise HTTPException(status_code=402, detail=f"Insufficient tokens. This action requires at least {cost} tokens.")

                logger.info(f"Attempting AI parsing with configured client / {model_id}")
                parsed_data = await AIResumeParser.parse_with_client(text, client, model_id)
                logger.info("AI Parsing successful")
                
                if is_platform_mode:
                    await plan_service.deduct_tokens(cost, "Resume Parsing")

            except HTTPException:
                raise
            except AIConfigurationError as e:
                logger.error(f"AI parsing configuration error: {str(e)}")
                raise HTTPException(status_code=400, detail="AI configuration is invalid. Please check your AI configuration settings.")
            except AIProviderError as e:
                logger.error(f"AI parsing provider error: {str(e)}")
                raise HTTPException(status_code=502, detail="AI connection failed. Please check your AI configuration settings and try again.")
            except Exception as e:
                logger.error(f"AI parsing failed: {repr(e)}")
                raise HTTPException(status_code=500, detail="AI parsing failed. Please try again.")

            if not parsed_data:
                raise HTTPException(status_code=400, detail="AI parsing failed or no AI model configured. Please configure an AI model in settings.")

            if isinstance(parsed_data, dict):
                sanitize_resume_data_inplace(parsed_data)

            stmt = select(Template).where(Template.key == "classic")
            result = await self.db.execute(stmt)
            template = result.scalar_one_or_none()
            
            template_id_to_use = template.id if template else "default"
            
            resume_id = str(uuid.uuid4())
                    
            parsed_data["sections"] = DEFAULT_RESUME_SECTIONS
            if "coverLetter" not in parsed_data:
                parsed_data["coverLetter"] = None
                
            raw_filename = file.filename
            display_filename = raw_filename[:-4] if raw_filename.lower().endswith(".pdf") else raw_filename
            new_resume = Resume(
                id=resume_id,
                user_id=self.user_id,
                title=f"Uploaded: {display_filename}",
                template_id=template_id_to_use,
                resume_data=parsed_data,
                create_and_tailor=True
            )
            
            self.db.add(new_resume)
            
            theme = ThemeConfig(
                id=str(uuid.uuid4()),
                resume_id=resume_id,
                primary_color='#475569',
                secondary_color='#4b5563',
                font_family=''
            )
            self.db.add(theme)
            
            cl_theme = CoverLetterThemeConfig(
                id=str(uuid.uuid4()),
                resume_id=resume_id,
                primary_color='#475569',
                secondary_color='#4b5563',
                font_family='',
                template_key='professional'
            )
            self.db.add(cl_theme)
            
            await self.db.commit()
            
            return await self.get_resume_by_id(resume_id)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Upload failed: {e}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    async def list_resumes(self) -> List[ResumeSummary]:
        """List all resumes for the current user."""
        stmt = select(Resume).where(Resume.user_id == self.user_id).order_by(Resume.updated_at.desc()).options(selectinload(Resume.template))
        result = await self.db.execute(stmt)
        resumes = result.scalars().all()
        
        return [
            ResumeSummary(
                id=r.id,
                title=r.title,
                template_id=r.template_id,
                template_key=r.template_key,
                share_enabled=bool(r.share_token),
                share_view_count=r.share_view_count or 0,
                created_at=r.created_at.isoformat(),
                updated_at=r.updated_at.isoformat(),
                create_and_tailor=r.create_and_tailor,
            )
            for r in resumes
        ]

    async def get_resume_share_link(self, resume_id: str) -> ResumeShareLinkResponse:
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id,
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        return self._build_share_link_response(resume)

    async def create_resume_share_link(self, resume_id: str, regenerate: bool = False) -> ResumeShareLinkResponse:
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id,
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        if resume.share_token and not regenerate:
            return self._build_share_link_response(resume)

        resume.share_token = await self._generate_unique_share_token()
        resume.share_view_count = 0
        resume.share_created_at = datetime.now(timezone.utc)
        resume.share_last_viewed_at = None
        resume.share_revoked_at = None
        resume.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(resume)
        return self._build_share_link_response(resume)

    async def revoke_resume_share_link(self, resume_id: str) -> ResumeShareLinkResponse:
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id,
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        if resume.share_token:
            resume.share_token = None
            resume.share_revoked_at = datetime.now(timezone.utc)
            resume.updated_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(resume)

        return self._build_share_link_response(resume)

    async def get_public_resume_by_token(self, token: str, increment_view: bool = True) -> PublicResumeResponse:
        normalized_token = (token or "").strip()
        if not normalized_token or not normalized_token.isalnum():
            raise HTTPException(status_code=404, detail="Shared resume not found")

        stmt = (
            select(Resume)
            .where(Resume.share_token == normalized_token)
            .options(
                selectinload(Resume.template),
                selectinload(Resume.theme),
            )
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Shared resume not found")

        if increment_view:
            now = datetime.now(timezone.utc)
            await self.db.execute(
                update(Resume)
                .where(Resume.id == resume.id)
                .values(
                    share_view_count=(resume.share_view_count or 0) + 1,
                    share_last_viewed_at=now,
                    updated_at=Resume.updated_at,
                )
            )
            await self.db.commit()

        return self._serialize_public_resume(resume)

    async def tailor_resume(self, resume_id: str, body: TailorResumeRequest) -> ResumeResponse:
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id
        ).options(
            selectinload(Resume.template),
            selectinload(Resume.theme),
            selectinload(Resume.cover_letters),
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        client, model_id, is_platform_mode = await get_configured_ai_client(self.db, self.user_id)
        plan_service = PlanService(self.db, self.user)
        cost = settings.COST_TAILOR_RESUME
        
        if is_platform_mode:
            if not await plan_service.has_sufficient_balance(cost):
                raise HTTPException(status_code=402, detail=f"Insufficient tokens. This action requires at least {cost} tokens.")
        
        resume_text = self._compose_resume_text(resume)
        try:
            job_match = await JobMatchService(client, model_id).analyse(
                body.job_title,
                body.job_description,
                resume_text,
            )
        except AIConfigurationError as e:
            logger.error("AI job match configuration error: {}", str(e))
            raise HTTPException(status_code=400, detail="AI configuration is invalid. Please check your AI configuration settings.")
        except AIProviderError as e:
            logger.error("AI job match provider error: {}", str(e))
            raise HTTPException(status_code=502, detail="AI connection failed. Please check your AI configuration settings and try again.")
        suggestions = job_match.get("suggestions") or []
        missing_keywords = job_match.get("missing_keywords") or []


        rd = resume.resume_data or {}
        if not isinstance(rd, dict):
            rd = {}

        def _set_section_visible(section_type: str) -> None:
            sections = rd.get("sections")
            if not isinstance(sections, list):
                return
            for item in sections:
                if not isinstance(item, dict):
                    continue
                if str(item.get("type", "")).strip().lower() == section_type.lower():
                    item["is_visible"] = True
                    item["isVisible"] = True
                    return

        raw_work_experiences = rd.get("workExperiences", [])
        work_experiences_context = []
        if isinstance(raw_work_experiences, list):
            for item in raw_work_experiences:
                if not isinstance(item, dict):
                    continue
                wid = str(item.get("id", "")).strip()
                if not wid:
                    continue
                work_experiences_context.append(
                    {
                        "id": wid,
                        "position": str(item.get("position", "")).strip(),
                        "company": str(item.get("company", "")).strip(),
                        "description": str(item.get("description", "")).strip(),
                    }
                )

        raw_projects = rd.get("projects", [])
        projects_context = []
        if isinstance(raw_projects, list):
            for item in raw_projects:
                if not isinstance(item, dict):
                    continue
                pid = str(item.get("id", "")).strip()
                if not pid:
                    continue
                projects_context.append(
                    {
                        "id": pid,
                        "name": str(item.get("name", "")).strip(),
                        "description": str(item.get("description", "")).strip(),
                        "technologies": item.get("technologies", []),
                        "link": str(item.get("link", "")).strip(),
                    }
                )

        existing_skill_names: set[str] = set()
        if isinstance(rd.get("skills"), list):
            for s in rd["skills"]:
                if isinstance(s, dict):
                    name = str(s.get("name", "")).strip().lower()
                    if name:
                        existing_skill_names.add(name)

        prompt = (
            "You are an expert resume writer.\n"
            "Generate a machine-applicable list of actions that apply the job-match suggestions to the resume data.\n\n"
            "Hard rules:\n"
            "- Do not fabricate experience, projects, employers, dates, or achievements.\n"
            "- Only update existing experiences/projects by using an existing id from the provided lists.\n"
            "- You may add missing keywords as Skills, but keep the level conservative (e.g. \"Familiar\").\n"
            "- Keep output concise and ATS-friendly.\n\n"
            "Return ONLY valid JSON with exactly this structure (no markdown, no extra keys):\n"
            "{\n"
            '  "actions": [\n'
            '    { "type": "update_summary", "content": string },\n'
            '    { "type": "add_skill", "name": string, "level": "Familiar" | "Good" | "Expert" },\n'
            '    { "type": "update_experience_description", "experienceId": string, "description": string },\n'
            '    { "type": "update_project_description", "projectId": string, "description": string },\n'
            '    { "type": "add_project", "name": string, "description": string, "technologies": [string], "link": string }\n'
            "  ]\n"
            "}\n\n"
            f"Tone: {body.tone}\n"
            f"Role: {body.job_title}\n\n"
            "Job Description:\n"
            f"\"\"\"\n{body.job_description}\n\"\"\"\n\n"
            "Job Match Suggestions:\n"
            f"{suggestions}\n\n"
            "Missing Keywords:\n"
            f"{missing_keywords}\n\n"
            "Resume (plain text):\n"
            f"\"\"\"\n{resume_text}\n\"\"\"\n\n"
            "Existing Skills (names only):\n"
            f"{sorted(existing_skill_names)}\n\n"
            "Work Experiences (allowed ids):\n"
            f"{work_experiences_context}\n\n"
            "Projects (allowed ids):\n"
            f"{projects_context}\n"
        )
        try:
            generated = await client.generate(prompt, model_id)
        except AIConfigurationError as e:
            logger.error("AI tailoring configuration error: {}", str(e))
            raise HTTPException(status_code=400, detail="AI configuration is invalid. Please check your AI configuration settings.")
        except AIProviderError as e:
            logger.error("AI tailoring provider error: {}", str(e))
            raise HTTPException(status_code=502, detail="AI connection failed. Please check your AI configuration settings and try again.")
        parsed = TextProcessor.extract_json(generated) or {}
        actions = parsed.get("actions") or []
        if not isinstance(actions, list):
            actions = []

        if "professionalSummary" not in rd or not isinstance(rd.get("professionalSummary"), dict):
            rd["professionalSummary"] = {}
        if "skills" not in rd or not isinstance(rd.get("skills"), list):
            rd["skills"] = []
        if "projects" not in rd or not isinstance(rd.get("projects"), list):
            rd["projects"] = []

        exp_by_id: dict[str, dict] = {}
        if isinstance(rd.get("workExperiences"), list):
            for exp in rd["workExperiences"]:
                if isinstance(exp, dict):
                    eid = str(exp.get("id", "")).strip()
                    if eid:
                        exp_by_id[eid] = exp

        project_by_id: dict[str, dict] = {}
        if isinstance(rd.get("projects"), list):
            for proj in rd["projects"]:
                if isinstance(proj, dict):
                    pid = str(proj.get("id", "")).strip()
                    if pid:
                        project_by_id[pid] = proj

        for action in actions:
            if not isinstance(action, dict):
                continue
            t = str(action.get("type", "")).strip()

            if t == "update_summary":
                content = sanitize_rich_text_html(str(action.get("content", "")).strip())
                if content:
                    rd["professionalSummary"]["content"] = content
                continue

            if t == "add_skill":
                name = str(action.get("name", "")).strip()
                if not name:
                    continue
                if name.lower() in existing_skill_names:
                    continue
                level = str(action.get("level", "Familiar")).strip() or "Familiar"
                rd["skills"].append({"id": str(uuid.uuid4()), "name": name, "level": level})
                existing_skill_names.add(name.lower())
                _set_section_visible("skills")
                continue

            if t == "update_experience_description":
                eid = str(action.get("experienceId", "")).strip()
                desc = sanitize_rich_text_html(str(action.get("description", "")).strip())
                if eid and desc and eid in exp_by_id:
                    exp_by_id[eid]["description"] = desc
                    _set_section_visible("experience")
                continue

            if t == "update_project_description":
                pid = str(action.get("projectId", "")).strip()
                desc = sanitize_rich_text_html(str(action.get("description", "")).strip())
                if pid and desc and pid in project_by_id:
                    project_by_id[pid]["description"] = desc
                    _set_section_visible("projects")
                continue

            if t == "add_project":
                name = str(action.get("name", "")).strip()
                desc = sanitize_rich_text_html(str(action.get("description", "")).strip())
                if not name or not desc:
                    continue
                technologies_raw = action.get("technologies", [])
                technologies = []
                if isinstance(technologies_raw, list):
                    technologies = [str(x).strip() for x in technologies_raw if str(x).strip()]
                link = str(action.get("link", "")).strip()
                rd["projects"].append(
                    {
                        "id": str(uuid.uuid4()),
                        "name": name,
                        "description": desc,
                        "technologies": technologies,
                        "link": link,
                        "startDate": "",
                        "endDate": "",
                    }
                )
                _set_section_visible("projects")
                continue
        
        sanitize_resume_data_inplace(rd)

        resume.resume_data = dict(rd)
        flag_modified(resume, "resume_data")
        resume.updated_at = datetime.utcnow()
        if is_platform_mode:
            await plan_service.deduct_tokens(cost, "Resume Tailoring")
        await self.db.commit()
        return await self.get_resume_by_id(resume_id)

    async def analyse_job_match(self, resume_id: str, body: JobMatchRequest) -> JobMatchResponse:
        from src.services.resumes.job_match_service import JobMatchService

        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id,
        ).options(
            selectinload(Resume.template),
            selectinload(Resume.theme),
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        client, model_id, is_platform_mode = await get_configured_ai_client(self.db, self.user_id)
        plan_service = PlanService(self.db, self.user)
        cost = settings.COST_JOB_MATCH

        if is_platform_mode and not await plan_service.has_sufficient_balance(cost):
            raise HTTPException(
                status_code=402,
                detail=f"Insufficient tokens.",
            )

        resume_text = self._compose_resume_text(resume)
        try:
            data = await JobMatchService(client, model_id).analyse(
                body.job_title, body.job_description, resume_text
            )
        except AIConfigurationError as e:
            logger.error("AI job match configuration error: {}", str(e))
            raise HTTPException(status_code=400, detail="AI configuration is invalid. Please check your AI configuration settings.")
        except AIProviderError as e:
            logger.error("AI job match provider error: {}", str(e))
            raise HTTPException(status_code=502, detail="AI connection failed. Please check your AI configuration settings and try again.")

        if is_platform_mode:
            await plan_service.deduct_tokens(cost, "Job Match Analysis")

        job_title = (body.job_title or "").strip()[:255]
        job_description = (body.job_description or "").strip()
        if len(job_description) > 20000:
            job_description = job_description[:20000]

        history = JobMatchHistory(
            user_id=self.user_id,
            resume_id=resume.id,
            job_title=job_title,
            job_description=job_description,
            match_score=float(data.get("match_score") or 0.0),
            summary=str(data.get("summary") or ""),
            matched_keywords=data.get("matched_keywords") or [],
            missing_keywords=data.get("missing_keywords") or [],
            suggestions=data.get("suggestions") or [],
        )
        self.db.add(history)
        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return JobMatchResponse(**data)

    async def list_job_match_history(
        self, resume_id: str, page: int = 1, size: int = 5
    ) -> PaginatedResponse[JobMatchHistorySummary]:
        query = (
            select(JobMatchHistory)
            .where(JobMatchHistory.user_id == self.user_id, JobMatchHistory.resume_id == resume_id)
            .order_by(JobMatchHistory.created_at.desc(), JobMatchHistory.id.desc())
        )
        return await paginate(self.db, query, page, size, schema=JobMatchHistorySummary)

    async def get_job_match_history_item(self, job_match_id: str) -> JobMatchHistoryItem:
        stmt = select(JobMatchHistory).where(JobMatchHistory.user_id == self.user_id, JobMatchHistory.id == job_match_id)
        result = await self.db.execute(stmt)
        row = result.scalar_one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Job match not found")
        return JobMatchHistoryItem(
            id=row.id,
            resume_id=row.resume_id,
            job_title=row.job_title,
            job_description=row.job_description,
            match_score=row.match_score,
            summary=row.summary,
            matched_keywords=row.matched_keywords or [],
            missing_keywords=row.missing_keywords or [],
            suggestions=row.suggestions or [],
            created_at=row.created_at,
        )

    async def delete_job_match_history_item(self, job_match_id: str) -> None:
        stmt = select(JobMatchHistory).where(JobMatchHistory.user_id == self.user_id, JobMatchHistory.id == job_match_id)
        result = await self.db.execute(stmt)
        row = result.scalar_one_or_none()
        if not row:
            return
        await self.db.delete(row)
        await self.db.commit()

    async def get_default_resume(self) -> ResumeResponse:
        stmt = select(Resume).where(Resume.user_id == self.user_id).order_by(Resume.updated_at.desc()).limit(1)
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()

        if not resume:
            raise HTTPException(status_code=404, detail="Default resume not found")

        return await self.get_resume_by_id(resume.id)

    async def update_resume(self, resume_id: str, data: ResumeUpdate) -> ResumeResponse:
        """Update a resume by ID."""
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id
        ).options(
            selectinload(Resume.template),
            selectinload(Resume.theme),
            selectinload(Resume.cover_letter_theme),
            selectinload(Resume.cover_letters),
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()

        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        input_template_id = data.template_id
        template_stmt = select(Template).where(Template.key == input_template_id)
        tpl_res = await self.db.execute(template_stmt)
        found_template = tpl_res.scalar_one_or_none()
        
        if found_template:
            resume.template_id = found_template.id
        else:
            t_id_stmt = select(Template).where(Template.id == input_template_id)
            t_id_res = await self.db.execute(t_id_stmt)
            if t_id_res.scalar_one_or_none():
                resume.template_id = input_template_id

        resume.title = data.title
        resume.create_and_tailor = data.create_and_tailor

        sanitized_data = data.model_copy(deep=True)
        if getattr(sanitized_data, "professional_summary", None) and hasattr(sanitized_data.professional_summary, "content"):
            sanitized_data.professional_summary.content = sanitize_rich_text_html(sanitized_data.professional_summary.content)
        for exp in getattr(sanitized_data, "work_experiences", []) or []:
            if hasattr(exp, "description"):
                exp.description = sanitize_rich_text_html(exp.description)
        for ed in getattr(sanitized_data, "education", []) or []:
            if hasattr(ed, "description"):
                ed.description = sanitize_rich_text_html(ed.description)
        for proj in getattr(sanitized_data, "projects", []) or []:
            if hasattr(proj, "description"):
                proj.description = sanitize_rich_text_html(proj.description)
        for award in getattr(sanitized_data, "awards", []) or []:
            if hasattr(award, "description"):
                award.description = sanitize_rich_text_html(award.description)
        for pub in getattr(sanitized_data, "publications", []) or []:
            if hasattr(pub, "description"):
                pub.description = sanitize_rich_text_html(pub.description)
        if getattr(sanitized_data, "cover_letter", None) and hasattr(sanitized_data.cover_letter, "content"):
            sanitized_data.cover_letter.content = sanitize_rich_text_html(sanitized_data.cover_letter.content)

        resume_data_dump = sanitized_data.model_dump(
            by_alias=True,
            include=RESUME_DATA_FIELD_NAMES,
        )
        if isinstance(resume_data_dump, dict):
            sanitize_resume_data_inplace(resume_data_dump)
        resume.resume_data = resume_data_dump
        flag_modified(resume, "resume_data")

        if "ai_analysis" in data.model_fields_set:
            resume.ai_analysis = data.ai_analysis
        
        if not resume.theme:
            resume.theme = ThemeConfig(id=str(uuid.uuid4()))
        
        resume.theme.primary_color = data.theme.primary_color
        resume.theme.secondary_color = data.theme.secondary_color
        resume.theme.font_family = data.theme.font_family

        if not resume.cover_letter_theme:
            resume.cover_letter_theme = CoverLetterThemeConfig(id=str(uuid.uuid4()), resume_id=resume.id)
        if data.cover_letter_theme:
            resume.cover_letter_theme.primary_color = data.cover_letter_theme.primary_color
            resume.cover_letter_theme.secondary_color = data.cover_letter_theme.secondary_color
            resume.cover_letter_theme.font_family = data.cover_letter_theme.font_family
            if getattr(data.cover_letter_theme, "template_key", None):
                resume.cover_letter_theme.template_key = data.cover_letter_theme.template_key

        if getattr(sanitized_data, "cover_letter", None):
            latest = None
            if resume.cover_letters:
                latest = sorted(
                    resume.cover_letters,
                    key=lambda x: (x.updated_at or x.created_at),
                    reverse=True
                )[0]
            if latest:
                latest.recipient_name = sanitized_data.cover_letter.recipient_name or latest.recipient_name
                latest.recipient_title = sanitized_data.cover_letter.recipient_title or latest.recipient_title
                latest.company_name = sanitized_data.cover_letter.company_name or latest.company_name
                latest.company_address = sanitized_data.cover_letter.company_address or latest.company_address
                latest.content = sanitized_data.cover_letter.content or latest.content
                latest.job_title = sanitized_data.cover_letter.job_title or latest.job_title
                latest.job_description = sanitized_data.cover_letter.job_description or latest.job_description
                if getattr(sanitized_data.cover_letter, "template_key", None):
                    latest.template_key = sanitized_data.cover_letter.template_key
                if getattr(sanitized_data.cover_letter, "tone", None):
                    latest.tone = sanitized_data.cover_letter.tone
                if getattr(sanitized_data.cover_letter, "length", None):
                    latest.length = sanitized_data.cover_letter.length
                latest.updated_at = datetime.utcnow()
            else:
                cl = DBCoverLetter(
                    id=str(uuid.uuid4()),
                    resume_id=resume.id,
                    name=(f"{sanitized_data.cover_letter.job_title} @ {sanitized_data.cover_letter.company_name}".strip() if (sanitized_data.cover_letter.job_title or sanitized_data.cover_letter.company_name) else "Cover Letter"),
                    recipient_name=sanitized_data.cover_letter.recipient_name or "",
                    recipient_title=sanitized_data.cover_letter.recipient_title or "",
                    company_name=sanitized_data.cover_letter.company_name or "",
                    company_address=sanitized_data.cover_letter.company_address or "",
                    content=sanitized_data.cover_letter.content or "",
                    job_title=sanitized_data.cover_letter.job_title or "",
                    job_description=sanitized_data.cover_letter.job_description or "",
                    template_key=(getattr(sanitized_data.cover_letter, "template_key", None) or (resume.cover_letter_theme.template_key if resume.cover_letter_theme else "professional")),
                    tone=(getattr(sanitized_data.cover_letter, "tone", None) or "professional"),
                    length=(getattr(sanitized_data.cover_letter, "length", None) or "medium"),
                )
                self.db.add(cl)
            resume.updated_at = datetime.utcnow()
        
        resume.updated_at = datetime.utcnow()

        await self.db.commit()
        
        return await self.get_resume_by_id(resume_id)

    async def delete_resume(self, resume_id: str) -> None:
        """Delete a resume by ID."""
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == self.user_id
        )
        result = await self.db.execute(stmt)
        resume = result.scalar_one_or_none()

        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        await self.db.delete(resume)
        await self.db.commit()
