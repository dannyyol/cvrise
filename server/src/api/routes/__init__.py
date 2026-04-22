from fastapi import APIRouter, Depends

from src.api.dependencies import get_current_user
from .resumes import review_router
from .pdf.pdf_route import router as pdf_router
from .resumes import resumes_router
from .cover_letters import router as cover_letters_router
from .template.templates_route import router as templates_router
from .cover_letters.cover_letter_template_route import router as cl_templates_router
from .settings import general_router as settings_router
from .settings import ai_router
from .settings.plan_routes import router as plan_router
from .ai_models import router as ai_models_router
from .auth.auth_routes import router as auth_router

def get_routes_router() -> APIRouter:
    router = APIRouter()
    protected = [Depends(get_current_user)]

    router.include_router(review_router, tags=["review"], dependencies=protected)
    router.include_router(pdf_router, tags=["export"])
    router.include_router(resumes_router, prefix="/resumes", tags=["resumes"], dependencies=protected)
    router.include_router(cover_letters_router, prefix="/resumes/{resume_id}/cover-letters", tags=["cover-letters"], dependencies=protected)
    router.include_router(templates_router, prefix="/templates", tags=["templates"], dependencies=protected)
    router.include_router(cl_templates_router, prefix="/cover-letter-templates", tags=["cover-letter-templates"], dependencies=protected)
    router.include_router(plan_router, prefix="/settings/plans", tags=["plans"])
    router.include_router(ai_router, prefix="/settings/ai", tags=["ai-settings"], dependencies=protected)
    router.include_router(settings_router, prefix="/settings", tags=["settings"], dependencies=protected)
    router.include_router(ai_models_router, prefix="/ai-models", tags=["ai-models"], dependencies=protected)
    router.include_router(auth_router)
    
    return router
