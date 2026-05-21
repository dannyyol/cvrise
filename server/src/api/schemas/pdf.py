from datetime import datetime
from typing import List, Optional

from src.api.schemas.resume import (
    BaseSchema,
    PersonalDetails,
    ProfessionalSummary,
    WorkExperience,
    Education,
    Skill,
    Project,
    Certification,
    Award,
    Publication,
    CustomSectionItem,
    CoverLetter,
    SectionConfig,
    ThemeConfig,
)


class PdfExportData(BaseSchema):
    personal_details: PersonalDetails
    professional_summary: ProfessionalSummary
    work_experiences: List[WorkExperience] = []
    education: List[Education] = []
    skills: List[Skill] = []
    projects: List[Project] = []
    certifications: List[Certification] = []
    awards: List[Award] = []
    publications: List[Publication] = []
    languages: List[CustomSectionItem] = []
    interests: List[CustomSectionItem] = []
    websites: List[CustomSectionItem] = []
    volunteering: List[CustomSectionItem] = []
    references: List[CustomSectionItem] = []
    custom: List[CustomSectionItem] = []
    cover_letter: Optional[CoverLetter] = None
    sections: List[SectionConfig] = []
    theme: ThemeConfig
    cover_letter_theme: Optional[ThemeConfig] = None


class PdfExportPrepareRequest(BaseSchema):
    template: str
    data: PdfExportData


class PdfExportPrepareResponse(BaseSchema):
    export_token: str
    expires_at: datetime


class PdfExportRequest(BaseSchema):
    export_token: str
