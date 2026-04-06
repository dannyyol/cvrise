from fastapi import APIRouter

def get_routes_router() -> APIRouter:
    router = APIRouter()
    # Attach CV review routes
    from .resumes import review_router
    router.include_router(review_router, tags=["review"])
    from .pdf import router as pdf_router
    router.include_router(pdf_router, tags=["export"])
    from .resumes import resumes_router
    router.include_router(resumes_router, prefix="/resumes", tags=["resumes"])
    from .cover_letters import router as cover_letters_router
    router.include_router(cover_letters_router, prefix="/resumes/{resume_id}/cover-letters", tags=["cover-letters"])
    from .templates import router as templates_router
    router.include_router(templates_router, prefix="/templates", tags=["templates"])
    from .cover_letters.cover_letter_templates import router as cl_templates_router
    router.include_router(cl_templates_router, prefix="/cover-letter-templates", tags=["cover-letter-templates"])
    from .settings import general_router as settings_router
    from .settings import ai_router
    from .settings.plan_routes import router as plan_router
    router.include_router(plan_router, prefix="/settings/plans", tags=["plans"])
    router.include_router(ai_router, prefix="/settings/ai", tags=["ai-settings"])
    router.include_router(settings_router, prefix="/settings", tags=["settings"])
    from .ai_models import router as ai_models_router
    router.include_router(ai_models_router, prefix="/ai-models", tags=["ai-models"])
    
    from .auth.auth_routes import router as auth_router
    router.include_router(auth_router)
    
    return router
