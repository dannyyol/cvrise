from fastapi import APIRouter

def create_api_router() -> APIRouter:
    from .routes import get_routes_router

    router = APIRouter()
    router.include_router(get_routes_router())
    return router
