from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import http_exception_handler, request_validation_exception_handler
from fastapi.exceptions import RequestValidationError
from loguru import logger
from pathlib import Path

from src.config import get_settings
from src.api import create_api_router

logger.add(
    Path(__file__).resolve().parents[1] / "logs" / "app.log",
    rotation="10 MB",
    enqueue=True,
    level="INFO",
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FastAPI lifespan startup")
    yield
    logger.info("FastAPI lifespan shutdown")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
    )

    async def _http_exc_handler(request: Request, exc: HTTPException):
        logger.error(f"HTTPException {exc.status_code} {request.method} {request.url} {exc.detail}")
        return await http_exception_handler(request, exc)

    async def _validation_exc_handler(request: Request, exc: RequestValidationError):
        logger.error(f"RequestValidationError {request.method} {request.url} {exc.errors()}")
        return await request_validation_exception_handler(request, exc)

    async def _unhandled_exc_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled exception {request.method} {request.url}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

    app.add_exception_handler(HTTPException, _http_exc_handler)
    app.add_exception_handler(RequestValidationError, _validation_exc_handler)
    app.add_exception_handler(Exception, _unhandled_exc_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    """
    API router is mounted behind API_PREFIX (typically "/api").

    If you see 307 redirects in access logs for list endpoints, check for
    trailing-slash mismatches between client calls and route declarations.
    """
    app.include_router(create_api_router(), prefix=settings.API_PREFIX)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "server.src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
