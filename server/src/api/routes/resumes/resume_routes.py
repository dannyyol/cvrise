from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.api.dependencies import get_current_user
from src.models.user import User
from src.api.schemas.resume import (
    ResumeResponse, ResumeSummary, ResumeUpdate, ResumeCreate, TailorResumeRequest
)
from src.services.resumes import ResumeService

router = APIRouter()

@router.post("/", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    resume_in: ResumeCreate,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Create a new resume with default sections."""
    service = ResumeService(session, user)
    return await service.create_resume(resume_in)

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Upload a PDF resume, parse it with AI, and create a new resume entry.
    """
    service = ResumeService(session, user)
    return await service.upload_resume(file)

@router.get("/", response_model=List[ResumeSummary])
async def list_resumes(
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """List all resumes for the current user."""
    service = ResumeService(session, user)
    return await service.list_resumes()

@router.post("/{resume_id}/tailor", response_model=ResumeResponse)
async def tailor_resume(
    resume_id: str,
    body: TailorResumeRequest,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ResumeService(session, user)
    return await service.tailor_resume(resume_id, body)

@router.get("/default", response_model=ResumeResponse)
async def get_default_resume(
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ResumeService(session, user)
    return await service.get_default_resume()

@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    data: ResumeUpdate,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update a resume by ID."""
    service = ResumeService(session, user)
    return await service.update_resume(resume_id, data)

@router.delete("/{resume_id}", status_code=204)
async def delete_resume(
    resume_id: str,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a resume by ID."""
    service = ResumeService(session, user)
    await service.delete_resume(resume_id)

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume_by_id(
    resume_id: str,
    session: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Fetch a specific resume by ID."""
    service = ResumeService(session, user)
    return await service.get_resume_by_id(resume_id)
