from fastapi import APIRouter
from .routes import get_routes_router

def create_api_router() -> APIRouter:
    router = APIRouter()
    router.include_router(get_routes_router())
    return router