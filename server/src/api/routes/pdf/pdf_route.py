import time
from dataclasses import dataclass

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.schemas.pdf import PdfExportPrepareRequest, PdfExportPrepareResponse, PdfExportRequest
from src.config import get_settings
from src.database import get_db
from src.services.pdf.pdf_service import PdfService

router = APIRouter()

@dataclass
class _TokenBucket:
    tokens: float
    last_refill: float


_rate_limit_buckets: dict[tuple[str, str], _TokenBucket] = {}


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _enforce_rate_limit(ip: str, key: str, limit_per_minute: int) -> None:
    if limit_per_minute <= 0:
        return
    now = time.monotonic()
    refill_per_sec = float(limit_per_minute) / 60.0
    capacity = float(limit_per_minute)
    bucket_key = (ip, key)
    bucket = _rate_limit_buckets.get(bucket_key)
    if bucket is None:
        _rate_limit_buckets[bucket_key] = _TokenBucket(tokens=capacity - 1.0, last_refill=now)
        return
    elapsed = max(0.0, now - bucket.last_refill)
    bucket.tokens = min(capacity, bucket.tokens + elapsed * refill_per_sec)
    bucket.last_refill = now
    if bucket.tokens < 1.0:
        from fastapi import HTTPException

        raise HTTPException(status_code=429, detail="Too many PDF export requests")
    bucket.tokens -= 1.0


@router.post("/export-pdf/prepare", response_model=PdfExportPrepareResponse, dependencies=[])
async def prepare_export_pdf(
    body: PdfExportPrepareRequest,
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    ip = _get_client_ip(request)
    _enforce_rate_limit(ip, "pdf_prepare", settings.PDF_EXPORT_PREPARE_RATE_LIMIT_PER_MINUTE)
    service = PdfService(session)
    return await service.prepare_export_pdf(template=body.template, data=body.data, requester_ip=ip)


@router.post("/export-pdf", dependencies=[])
async def export_pdf(
    body: PdfExportRequest,
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    ip = _get_client_ip(request)
    _enforce_rate_limit(ip, "pdf_redeem", settings.PDF_EXPORT_REDEEM_RATE_LIMIT_PER_MINUTE)
    service = PdfService(session)
    return await service.export_pdf_from_token(export_token=body.export_token, requester_ip=ip)
