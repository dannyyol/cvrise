from .resume_routes import router as resumes_router
from .review_routes import router as review_router
from .sample_route import router as sample_router

__all__ = ["resumes_router", "review_router", "sample_router"]
