from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class PersonalDetails(BaseSchema):
    full_name: str
    email: str
    phone: str
    address: str
    job_title: str
    website: str
    linkedin: str
    github: str

class ProfessionalSummary(BaseSchema):
    content: str

class WorkExperience(BaseSchema):
    id: str
    company: str
    position: str
    location: str
    start_date: str
    end_date: str
    current: bool
    description: str

class Education(BaseSchema):
    id: str
    institution: str
    degree: str
    field_of_study: str
    start_date: str
    end_date: str
    current: bool
    description: str

class Skill(BaseSchema):
    id: str
    name: str
    level: str

class Project(BaseSchema):
    id: str
    name: str
    description: str
    technologies: List[str]
    link: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class Certification(BaseSchema):
    id: str
    name: str
    issuer: str
    issue_date: str
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    link: str

class Award(BaseSchema):
    id: str
    title: str
    issuer: str
    date: str
    description: str

class Publication(BaseSchema):
    id: str
    title: str
    publisher: str
    date: str
    description: str
    link: str

class CustomSectionItem(BaseSchema):
    id: str
    name: str
    description: str
    date: str
    location: str
    url: str

class CoverLetter(BaseSchema):
    recipient_name: str = ""
    recipient_title: str = ""
    company_name: str = ""
    company_address: str = ""
    content: str = ""
    job_title: str = ""
    job_description: str = ""
    template_key: str = "soft-modern"
    tone: str = "professional"
    length: str = "medium"

class CoverLetterItem(BaseSchema):
    id: str
    title: str
    recipient_name: str
    recipient_title: str
    company_name: str
    company_address: str
    content: str
    job_title: str
    job_description: str
    template_key: str
    tone: str
    length: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class CoverLetterCreate(BaseSchema):
    title: Optional[str] = None
    recipient_name: str = ""
    recipient_title: str = ""
    company_name: str = ""
    company_address: str = ""
    content: str = ""
    job_title: str = ""
    job_description: str = ""
    template_key: str = "soft-modern"
    tone: str = "professional"
    length: str = "medium"

class CoverLetterGenerateRequest(BaseSchema):
    title: Optional[str] = None
    recipient_name: str = ""
    recipient_title: str = ""
    company_name: str = ""
    company_address: str = ""
    job_title: str = ""
    job_description: str = ""
    tone: str = "professional"
    template_key: str = "soft-modern"
    length: str = "medium"

class TailorResumeRequest(BaseSchema):
    job_title: str = ""
    job_description: str = ""
    tone: str = "professional"

class SectionConfig(BaseSchema):
    id: str
    type: str
    title: str
    is_visible: bool
    order: int

class ThemeConfig(BaseSchema):
    primary_color: str
    secondary_color: str
    font_family: str
    font_size: Optional[str] = "medium"
    letter_spacing: Optional[str] = "normal"
    line_spacing: Optional[str] = "normal"
    template_key: Optional[str] = None
    date_locale: Optional[str] = ""

class ResumeCreate(BaseSchema):
    title: Optional[str] = "Untitled Resume"
    template_id: Optional[str] = "classic"
    create_and_tailor: Optional[bool] = False

class ResumeResponse(BaseSchema):
    id: str
    title: str
    create_and_tailor: bool = False
    personal_details: PersonalDetails
    professional_summary: ProfessionalSummary
    work_experiences: List[WorkExperience]
    education: List[Education]
    skills: List[Skill]
    projects: List[Project]
    certifications: List[Certification]
    awards: List[Award]
    publications: List[Publication]
    interests: List[CustomSectionItem]
    languages: List[CustomSectionItem]
    websites: List[CustomSectionItem]
    volunteering: List[CustomSectionItem]
    references: List[CustomSectionItem]
    custom: List[CustomSectionItem]
    cover_letter: Optional[CoverLetter] = None
    sections: List[SectionConfig]
    theme: ThemeConfig
    cover_letter_theme: ThemeConfig
    template_id: str = Field(..., alias="template_id")
    template_key: str = Field(..., alias="template_key")
    resume_data: Optional[dict] = Field(default=None, alias="resumeData")
    ai_analysis: Optional[dict] = None
    created_at: str
    updated_at: str

class ResumeUpdate(ResumeResponse):
    """Schema for updating a resume. Currently same as response."""
    template_key: Optional[str] = None
    pass

class ResumeSummary(BaseSchema):
    id: str
    title: str
    create_and_tailor: bool = False
    template_id: str = Field(..., alias="template_id")
    template_key: str = Field(..., alias="template_key")
    created_at: str
    updated_at: str
