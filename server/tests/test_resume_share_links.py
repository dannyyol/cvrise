import asyncio
import os
import sys
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.constants import DEFAULT_RESUME_SECTIONS
from src.models.resume import Resume
from src.services.resumes.resume_service import ResumeService


class _FakeResult:
    def __init__(self, value):
        self._value = value

    def scalar_one_or_none(self):
        return self._value


class _FakeSession:
    def __init__(self, queued_results, resume=None):
        self._queued_results = list(queued_results)
        self._resume = resume
        self.commit_count = 0
        self.refresh_count = 0

    async def execute(self, stmt):
        if getattr(stmt, "is_update", False):
            if self._resume is not None:
                self._resume.share_view_count = (self._resume.share_view_count or 0) + 1
                self._resume.share_last_viewed_at = datetime.now(timezone.utc)
            return _FakeResult(None)
        if not self._queued_results:
            raise AssertionError("Unexpected database execute call")
        return _FakeResult(self._queued_results.pop(0))

    async def commit(self):
        self.commit_count += 1

    async def refresh(self, _obj):
        self.refresh_count += 1


def _build_resume(**overrides):
    resume_data = {
        "sections": DEFAULT_RESUME_SECTIONS,
        "personalDetails": {
            "fullName": "Jane Doe",
            "email": "jane@example.com",
            "phone": "",
            "address": "",
            "jobTitle": "Engineer",
            "website": "",
            "linkedin": "",
            "github": "",
        },
        "professionalSummary": {"content": "Experienced engineer"},
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
    }
    base = Resume(
        id="resume-1",
        title="Jane Doe Resume",
        user_id="user-1",
        template_id="classic",
        resume_data=resume_data,
        create_and_tailor=False,
    )
    base.created_at = datetime.now(timezone.utc)
    base.updated_at = datetime.now(timezone.utc)
    base.share_view_count = 0
    for key, value in overrides.items():
        setattr(base, key, value)
    return base


def test_create_resume_share_link_generates_short_public_token():
    resume = _build_resume()
    session = _FakeSession([resume, None], resume=resume)
    service = ResumeService(session, SimpleNamespace(id="user-1"))

    with patch("src.services.resumes.resume_service.settings.CLIENT_BASE_URL", "https://app.example.com"):
        result = asyncio.run(service.create_resume_share_link("resume-1"))

    assert result.enabled is True
    assert result.token is not None
    assert len(result.token) == 10
    assert result.token.isalnum()
    assert result.url == f"https://app.example.com/cv/{result.token}"
    assert session.commit_count == 1
    assert session.refresh_count == 1


def test_get_public_resume_by_token_increments_view_count():
    resume = _build_resume(share_token="Ab12Cd34Ef", share_view_count=2)
    session = _FakeSession([resume], resume=resume)
    service = ResumeService(session)

    result = asyncio.run(service.get_public_resume_by_token("Ab12Cd34Ef"))

    assert result.title == "Jane Doe Resume"
    assert result.personal_details.full_name == "Jane Doe"
    assert resume.share_view_count == 3
    assert resume.share_last_viewed_at is not None
    assert session.commit_count == 1


def test_get_public_resume_by_token_can_skip_view_increment():
    resume = _build_resume(share_token="Ab12Cd34Ef", share_view_count=2)
    session = _FakeSession([resume], resume=resume)
    service = ResumeService(session)

    result = asyncio.run(service.get_public_resume_by_token("Ab12Cd34Ef", increment_view=False))

    assert result.title == "Jane Doe Resume"
    assert resume.share_view_count == 2
    assert resume.share_last_viewed_at is None
    assert session.commit_count == 0
