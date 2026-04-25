import asyncio
import os
import sys
from unittest.mock import patch

import httpx
from fastapi import APIRouter, HTTPException

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


def _build_app(debug: bool):
    from src import main as main_module

    class _Settings:
        APP_NAME = "test"
        APP_VERSION = "test"
        API_PREFIX = "/api"
        HOST = "127.0.0.1"
        PORT = 8000
        DEBUG = debug
        CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]

    with (
        patch.object(main_module, "get_settings", return_value=_Settings()),
        patch.object(main_module, "create_api_router", return_value=APIRouter()),
    ):
        return main_module.create_app()


def test_http_exception_500_detail_hidden_when_debug_false():
    app = _build_app(debug=False)

    @app.get("/boom")
    async def boom():
        raise HTTPException(status_code=500, detail="(pymysql.err.OperationalError) (1045, 'Access denied')")

    async def _run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.get("/boom")

    res = asyncio.run(_run())

    assert res.status_code == 500
    assert res.json() == {"detail": "Internal Server Error"}


def test_http_exception_500_detail_preserved_when_debug_true():
    app = _build_app(debug=True)

    @app.get("/boom")
    async def boom():
        raise HTTPException(status_code=500, detail="db down")

    async def _run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.get("/boom")

    res = asyncio.run(_run())

    assert res.status_code == 500
    assert res.json() == {"detail": "db down"}
