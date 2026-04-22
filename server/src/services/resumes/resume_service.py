from datetime import datetime
from typing import Optional, List
import uuid
from loguru import logger
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified

from src.models.resume import Resume, ThemeConfig, Template, CoverLetterThemeConfig
from src.models.settings import Setting
from src.models.ai_model import AIModel
from src.models.cover_letter import CoverLetter as DBCoverLetter
from src.constants import DEFAULT_RESUME_SECTIONS
from src.api.schemas.resume import (
    ResumeResponse, ResumeSummary, ResumeUpdate, ResumeCreate, TailorResumeRequest
)
from src.services.file_parser_service import FileParser
from src.services.ai.ai_resume_parser_service import AIResumeParser
from src.services.ai.ai_connection_service import AIConnectionService
from src.services.ai.ai_clients_service import (
    OpenAIClient, AnthropicClient, GoogleClient, OllamaClient, TextProcessor
)
from src.services.settings.ai_service import get_configured_ai_client
from src.services.settings.plan_service import PlanService
from src.config import settings

from src.models.user import User

class ResumeService:
    def __init__(self, db: AsyncSession, user: Optional[User] = None):
        self.db = db
        self.user = user

    @property
    def user_id(self) -> str:
        return self.user.id

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

        if resume.resume_data:
            rd = resume.resume_data
            
            cover_letter_data = rd.get("coverLetter")
            if not cover_letter_data and resume.cover_letters:
                latest = sorted(
                    resume.cover_letters,
                    key=lambda x: (x.updated_at or x.created_at),
                    reverse=True
                )[0]
                cover_letter_data = {
                    "recipient_name": latest.recipient_name,
                    "recipient_title": latest.recipient_title,
                    "company_name": latest.company_name,
                    "company_address": latest.company_address,
                    "content": latest.content,
                    "job_title": latest.job_title,
                    "job_description": latest.job_description,
                    "template_key": latest.template_key,
                    "tone": latest.tone,
                    "length": latest.length,
                }

            return ResumeResponse(
                id=resume.id,
                title=resume.title,
                template_id=resume.template_id,
                template_key=resume.template_key,
                created_at=resume.created_at.isoformat() if resume.created_at else "",
                updated_at=resume.updated_at.isoformat() if resume.updated_at else "",
                resume_data=rd,
                ai_analysis=resume.ai_analysis,
                
                personal_details=rd.get("personalDetails", {}),
                professional_summary=rd.get("professionalSummary", {}),
                work_experiences=rd.get("workExperiences", []),
                education=rd.get("education", []),
                skills=rd.get("skills", []),
                projects=rd.get("projects", []),
                certifications=rd.get("certifications", []),
                awards=rd.get("awards", []),
                publications=rd.get("publications", []),
                languages=rd.get("languages", []),
                interests=rd.get("interests", []),
                websites=rd.get("websites", []),
                volunteering=rd.get("volunteering", []),
                references=rd.get("references", []),
                custom=rd.get("custom", []),
                sections=rd.get("sections", []),
                
                theme=rd.get("theme") or resume.theme,
                cover_letter_theme=rd.get("coverLetterTheme") or resume.cover_letter_theme,
                
                cover_letter=cover_letter_data
            )

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

        rd = resume.resume_data or {}
        
        sections_config = rd.get("sections", [])
        if not sections_config:
            sections_config = DEFAULT_RESUME_SECTIONS
            
        cover_letter_data = rd.get("coverLetter")
        if not cover_letter_data and resume.cover_letters:
            latest = sorted(
                resume.cover_letters,
                key=lambda x: (x.updated_at or x.created_at),
                reverse=True
            )[0]
            cover_letter_data = {
                "recipient_name": latest.recipient_name,
                "recipient_title": latest.recipient_title,
                "company_name": latest.company_name,
                "company_address": latest.company_address,
                "content": latest.content,
                "job_title": latest.job_title,
                "job_description": latest.job_description,
                "template_key": latest.template_key,
                "tone": latest.tone,
                "length": latest.length,
            }

        return ResumeResponse(
            id=resume.id,
            title=resume.title,
            user_id=resume.user_id,
            created_at=resume.created_at,
            updated_at=resume.updated_at,
            template_id=resume.template_id,
            create_and_tailor=resume.create_and_tailor,
            template=resume.template,
            theme=resume.theme,
            cover_letter_theme=resume.cover_letter_theme,
            cover_letters=resume.cover_letters,
            ai_analysis=resume.ai_analysis,
            
            cover_letter=cover_letter_data,
            
            sections=sections_config,
            
            personal_details=rd.get("personalDetails"),
            professional_summary=rd.get("professionalSummary"),
            work_experiences=rd.get("workExperiences", []),
            education=rd.get("education", []),
            skills=rd.get("skills", []),
            projects=rd.get("projects", []),
            certifications=rd.get("certifications", []),
            awards=rd.get("awards", []),
            publications=rd.get("publications", []),
            languages=rd.get("languages", []),
            interests=rd.get("interests", []),
            websites=rd.get("websites", []),
            volunteering=rd.get("volunteering", []),
            references=rd.get("references", []),
            custom_sections=rd.get("custom", []),
            
            resume_data=rd
        )

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
        Upload a PDF resume, parse it with AI, and create a new resume entry.
        """
        try:
            content = await file.read()
            filename = file.filename.lower() if file.filename else "uploaded_resume.pdf"
            
            if not filename.endswith(".pdf"):
                 raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF.")

            text = FileParser.extract_text_from_pdf(content)
            parsed_data = None
            
            try:
                client, model_id, is_platform_mode = await get_configured_ai_client(self.db)
                
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
            except Exception as e:
                logger.error(f"AI parsing failed: {repr(e)}")
                raise HTTPException(status_code=500, detail=f"AI parsing failed: {repr(e)}")

            if not parsed_data:
                raise HTTPException(status_code=400, detail="AI parsing failed or no AI model configured. Please configure an AI model in settings.")

            stmt = select(Template).where(Template.key == "classic")
            result = await self.db.execute(stmt)
            template = result.scalar_one_or_none()
            
            template_id_to_use = template.id if template else "default"
            
            resume_id = str(uuid.uuid4())
                    
            parsed_data["sections"] = DEFAULT_RESUME_SECTIONS
            if "coverLetter" not in parsed_data:
                parsed_data["coverLetter"] = None
                
            new_resume = Resume(
                id=resume_id,
                user_id=self.user_id,
                title=f"Uploaded: {file.filename}",
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
                created_at=r.created_at.isoformat(),
                updated_at=r.updated_at.isoformat(),
                create_and_tailor=r.create_and_tailor,
            )
            for r in resumes
        ]

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
        
        client, model_id, is_platform_mode = await get_configured_ai_client(self.db)
        plan_service = PlanService(self.db, self.user)
        cost = settings.COST_TAILOR_RESUME
        
        if is_platform_mode:
            if not await plan_service.has_sufficient_balance(cost):
                raise HTTPException(status_code=402, detail=f"Insufficient tokens. This action requires at least {cost} tokens.")
        
        resume_text = self._compose_resume_text(resume)
        prompt = (
            "Rewrite the resume's professional summary and extract top skills aligned to the job.\n\n"
            "Return ONLY valid JSON:\n"
            "{\n"
            '  "summary": string,\n'
            '  "skills": [string]\n'
            "}\n\n"
            f"Tone: {body.tone}\n"
            f"Role: {body.job_title}\n"
            "Job Description:\n"
            f"\"\"\"\n{body.job_description}\n\"\"\"\n\n"
            "Resume:\n"
            f"\"\"\"\n{resume_text}\n\"\"\"\n"
        )
        generated = await client.generate(prompt, model_id)
        parsed = TextProcessor.extract_json(generated) or {}
        new_summary = str(parsed.get("summary", "")).strip()
        new_skills = [str(s).strip() for s in (parsed.get("skills", []) or []) if str(s).strip()]
        if not new_summary:
            new_summary = TextProcessor.strip_code_fences(generated).strip()
        
        rd = resume.resume_data or {}
        
        if "professionalSummary" not in rd:
            rd["professionalSummary"] = {}
        rd["professionalSummary"]["content"] = new_summary or (rd["professionalSummary"].get("content", "") or "")
        
        if new_skills:
            new_skill_objs = [{"id": str(uuid.uuid4()), "name": s, "level": "Good"} for s in new_skills]
            rd["skills"] = new_skill_objs

        resume.resume_data = dict(rd)
        flag_modified(resume, "resume_data")
        resume.updated_at = datetime.utcnow()
        if is_platform_mode:
            await plan_service.deduct_tokens(cost, "Resume Tailoring")
        await self.db.commit()
        return await self.get_resume_by_id(resume_id)

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
        
        resume.resume_data = data.model_dump(by_alias=True, exclude={"ai_analysis"})

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

        if getattr(data, "cover_letter", None):
            latest = None
            if resume.cover_letters:
                latest = sorted(
                    resume.cover_letters,
                    key=lambda x: (x.updated_at or x.created_at),
                    reverse=True
                )[0]
            if latest:
                latest.recipient_name = data.cover_letter.recipient_name or latest.recipient_name
                latest.recipient_title = data.cover_letter.recipient_title or latest.recipient_title
                latest.company_name = data.cover_letter.company_name or latest.company_name
                latest.company_address = data.cover_letter.company_address or latest.company_address
                latest.content = data.cover_letter.content or latest.content
                latest.job_title = data.cover_letter.job_title or latest.job_title
                latest.job_description = data.cover_letter.job_description or latest.job_description
                if getattr(data.cover_letter, "template_key", None):
                    latest.template_key = data.cover_letter.template_key
                if getattr(data.cover_letter, "tone", None):
                    latest.tone = data.cover_letter.tone
                if getattr(data.cover_letter, "length", None):
                    latest.length = data.cover_letter.length
                latest.updated_at = datetime.utcnow()
            else:
                cl = DBCoverLetter(
                    id=str(uuid.uuid4()),
                    resume_id=resume.id,
                    name=(f"{data.cover_letter.job_title} @ {data.cover_letter.company_name}".strip() if (data.cover_letter.job_title or data.cover_letter.company_name) else "Cover Letter"),
                    recipient_name=data.cover_letter.recipient_name or "",
                    recipient_title=data.cover_letter.recipient_title or "",
                    company_name=data.cover_letter.company_name or "",
                    company_address=data.cover_letter.company_address or "",
                    content=data.cover_letter.content or "",
                    job_title=data.cover_letter.job_title or "",
                    job_description=data.cover_letter.job_description or "",
                    template_key=(getattr(data.cover_letter, "template_key", None) or (resume.cover_letter_theme.template_key if resume.cover_letter_theme else "professional")),
                    tone=(getattr(data.cover_letter, "tone", None) or "professional"),
                    length=(getattr(data.cover_letter, "length", None) or "medium"),
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
