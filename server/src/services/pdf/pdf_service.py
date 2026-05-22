import json
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import HTTPException
from fastapi.responses import Response
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

from src.config import get_settings
from src.models.pdf_export_intent import PdfExportIntent
from src.services.pdf.pdf_export_service import generate_pdf_from_preview
from src.utils.html_sanitizer import sanitize_resume_data_inplace
from src.api.schemas.pdf import PdfExportData, PdfExportPrepareResponse

class PdfService:
    def __init__(self, session: AsyncSession):
        self._session = session

    def _utc_now(self) -> datetime:
        return datetime.now(timezone.utc)

    def _to_aware_utc(self, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    def _validate_template(self, template: Any) -> str:
        if not isinstance(template, str):
            raise HTTPException(status_code=400, detail="Invalid template")
        candidate = template.strip()
        if not candidate:
            raise HTTPException(status_code=400, detail="Invalid template")
        if len(candidate) > 64:
            raise HTTPException(status_code=400, detail="Invalid template")
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", candidate):
            raise HTTPException(status_code=400, detail="Invalid template")
        return candidate

    def _get_token_secret(self) -> tuple[str, str]:
        settings = get_settings()
        secret = settings.PDF_EXPORT_TOKEN_SECRET or settings.JWT_SECRET_KEY
        algorithm = settings.JWT_ALGORITHM
        if not secret:
            raise HTTPException(status_code=500, detail="PDF export is not configured")
        return secret, algorithm

    async def prepare_export_pdf(self, template: str, data: PdfExportData, requester_ip: Optional[str] = None) -> PdfExportPrepareResponse:
        settings = get_settings()
        safe_template = self._validate_template(template)

        resume_data = data.model_dump(by_alias=True)
        sanitize_resume_data_inplace(resume_data)

        payload_json = json.dumps({"template": safe_template, "data": resume_data}, separators=(",", ":"), ensure_ascii=True)
        if len(payload_json.encode("utf-8")) > settings.PDF_EXPORT_MAX_PAYLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Export payload too large")

        now = self._utc_now()
        expires_at = now + timedelta(seconds=settings.PDF_EXPORT_TOKEN_TTL_SECONDS)

        intent = PdfExportIntent(
            template=safe_template,
            data=resume_data,
            requester_ip=requester_ip,
            expires_at=expires_at,
        )
        self._session.add(intent)
        await self._session.commit()
        await self._session.refresh(intent)

        secret, algorithm = self._get_token_secret()
        token = jwt.encode(
            {"typ": "pdf_export", "eid": intent.id, "iat": int(now.timestamp()), "exp": int(expires_at.timestamp())},
            secret,
            algorithm=algorithm,
        )
        return PdfExportPrepareResponse(export_token=token, expires_at=expires_at)

    async def export_pdf_from_token(self, export_token: str, requester_ip: Optional[str] = None) -> Response:
        if not export_token or not isinstance(export_token, str):
            raise HTTPException(status_code=400, detail="Missing export token")

        secret, algorithm = self._get_token_secret()
        try:
            payload = jwt.decode(export_token, secret, algorithms=[algorithm])
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid export token")

        if payload.get("typ") != "pdf_export":
            raise HTTPException(status_code=401, detail="Invalid export token")
        intent_id = payload.get("eid")
        if not intent_id:
            raise HTTPException(status_code=401, detail="Invalid export token")

        now = self._utc_now()
        result = await self._session.execute(
            select(PdfExportIntent).where(PdfExportIntent.id == str(intent_id)).with_for_update()
        )
        intent = result.scalar_one_or_none()
        if intent is None:
            raise HTTPException(status_code=404, detail="Export not found")
        if intent.consumed_at is not None:
            raise HTTPException(status_code=409, detail="Export token already used")
        expires_at = self._to_aware_utc(intent.expires_at)
        if expires_at <= now:
            raise HTTPException(status_code=410, detail="Export token expired")
        if intent.requester_ip and requester_ip and intent.requester_ip != requester_ip:
            raise HTTPException(status_code=401, detail="Invalid export token")

        intent.consumed_at = now
        await self._session.commit()

        try:
            settings = get_settings()
            base_url = settings.PDF_CLIENT_BASE_URL or settings.CLIENT_BASE_URL
            preview_url = f"{base_url}/pdf-render?template={intent.template}"
            pdf_bytes = await generate_pdf_from_preview(preview_url, template=intent.template, data=intent.data)
            headers = {"Content-Disposition": "attachment; filename=cv.pdf"}
            return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
        except ModuleNotFoundError:
            raise HTTPException(status_code=500, detail="Playwright is not installed")
        except Exception as e:
            logger.exception("Failed to generate PDF for template {}: {}", intent.template, e)
            raise HTTPException(status_code=500, detail="Failed to generate PDF")

    async def export_pdf(self, payload: Dict[str, Any]) -> Response:
        try:
            template = payload.get("template")
            data = payload.get("data")
            if not template or not data:
                raise HTTPException(status_code=400, detail="Missing template or data")

            settings = get_settings()
            base_url = settings.PDF_CLIENT_BASE_URL or settings.CLIENT_BASE_URL
            preview_url = f"{base_url}/pdf-render?template={template}"
            try:
                pdf_bytes = await generate_pdf_from_preview(preview_url, template=template, data=data)
                headers = {"Content-Disposition": "attachment; filename=cv.pdf"}
                return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
            except ModuleNotFoundError:
                raise HTTPException(status_code=500, detail="Playwright is not installed")
            except Exception as e:
                logger.exception("Failed to generate PDF for template {}: {}", template, e)
                raise HTTPException(status_code=500, detail="Failed to generate PDF")
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Unexpected PDF export failure: {}", e)
            raise HTTPException(status_code=500, detail="Export failed")
