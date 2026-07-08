from datetime import datetime, timezone

from src.api.schemas.resume import ResumeUpdate, ResumeShareLinkResponse, ThemeConfig, PersonalDetails, ProfessionalSummary


def test_resume_update_dump_excludes_metadata_with_datetime_fields():
    """resume_data must not include share_link datetimes or other API metadata."""
    from src.constants import RESUME_DATA_FIELD_NAMES

    data = ResumeUpdate(
        id="resume-1",
        title="Test Resume",
        template_id="classic",
        template_key="classic",
        created_at="2026-01-01T00:00:00Z",
        updated_at="2026-01-02T00:00:00Z",
        personal_details=PersonalDetails(
            full_name="Jane Doe",
            email="jane@example.com",
            phone="",
            address="",
            job_title="Engineer",
            website="",
            linkedin="",
            github="",
        ),
        professional_summary=ProfessionalSummary(content="Summary"),
        theme=ThemeConfig(
            primary_color="#000000",
            secondary_color="#666666",
            font_family="Inter",
        ),
        cover_letter_theme=ThemeConfig(
            primary_color="#000000",
            secondary_color="#666666",
            font_family="Inter",
            template_key="soft-modern",
        ),
        share_link=ResumeShareLinkResponse(
            enabled=True,
            token="abc123",
            url="http://example.com/cv/abc123",
            view_count=3,
            created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
            last_viewed_at=datetime(2026, 1, 2, tzinfo=timezone.utc),
            revoked_at=None,
        ),
    )

    resume_data = data.model_dump(by_alias=True, include=RESUME_DATA_FIELD_NAMES)

    assert "shareLink" not in resume_data
    assert "id" not in resume_data
    assert "title" not in resume_data
    assert resume_data["personalDetails"]["fullName"] == "Jane Doe"
    assert resume_data["professionalSummary"]["content"] == "Summary"

    import json
    json.dumps(resume_data)
