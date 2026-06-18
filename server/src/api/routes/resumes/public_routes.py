from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.api.schemas.resume import PublicResumeResponse
from src.services.resumes import ResumeService

router = APIRouter()


@router.get("/public/{token}", response_model=PublicResumeResponse)
async def get_public_resume(
    token: str,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db),
):
    """Return a shared resume by its public token."""
    service = ResumeService(session)
    normalized_token = (token or "").strip()
    cookie_key = f"cvrise_seen_{normalized_token}" if normalized_token.isalnum() else None
    now = int(datetime.now(timezone.utc).timestamp())

    increment_view = True
    raw_value = request.cookies.get(cookie_key) if cookie_key else None
    if raw_value:
        try:
            last_seen = int(raw_value)
            if now - last_seen < 60 * 60 * 24:
                increment_view = False
        except ValueError:
            increment_view = True

    result = await service.get_public_resume_by_token(normalized_token, increment_view=increment_view)
    if increment_view and cookie_key:
        response.set_cookie(
            key=cookie_key,
            value=str(now),
            max_age=60 * 60 * 24,
            secure=request.url.scheme == "https",
            httponly=True,
            samesite="lax",
            path="/",
        )
    return result
