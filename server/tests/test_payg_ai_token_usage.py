import asyncio
import os
import sys
from types import SimpleNamespace
from unittest.mock import patch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.models.settings import Setting
from src.services.ai.ai_clients_service import OpenAIClient
from src.services.settings.ai_service import get_configured_ai_client
from src.api.routes.resumes.review_routes import review_resume


class _FakeScalarResult:
    def __init__(self, value):
        self._value = value

    def scalar_one_or_none(self):
        return self._value


class _FakeSession:
    def __init__(self, setting: Setting | None):
        self._setting = setting

    async def execute(self, stmt):
        return _FakeScalarResult(self._setting)


def test_get_configured_ai_client_platform_mode_uses_platform_ai_key():
    db = _FakeSession(
        Setting(
            key="ai_config",
            value={
                "usageMode": "platform",
            },
        )
    )

    class _AppSettings:
        PLATFORM_OPENAI_API_KEY = "platform-key"
        PLATFORM_OPENAI_MODEL = "gpt-platform"

    with patch("src.services.settings.ai_service.get_settings", return_value=_AppSettings()):
        client, model_id, is_platform_mode = asyncio.run(get_configured_ai_client(db))

    assert is_platform_mode is True
    assert model_id == "gpt-platform"
    assert isinstance(client, OpenAIClient)
    assert client.base_url == "https://api.openai.com/v1"
    assert client.api_key == "platform-key"


def test_review_resume_platform_mode_charges_tokens_for_default_ai_connection():
    class _FakePlanService:
        def __init__(self, session, user):
            self.calls: list[tuple] = []

        async def has_sufficient_balance(self, amount: int) -> bool:
            self.calls.append(("has_sufficient_balance", amount))
            return True

        async def deduct_tokens(self, amount: int, description: str):
            self.calls.append(("deduct_tokens", amount, description))

    class _FakeReviewService:
        async def review_cv_payload(self, payload):
            return {"ok": True}

    fake_plan_service = _FakePlanService(None, None)

    class _FakeUser:
        id = "user-1"

    payload = {"sections": {"summary": "hello"}}

    with (
        patch("src.api.routes.resumes.review_routes.PlanService", side_effect=lambda s, u: fake_plan_service),
        patch(
            "src.api.routes.resumes.review_routes.get_configured_ai_client",
            return_value=(SimpleNamespace(), "gpt-platform", True),
        ),
        patch("src.api.routes.resumes.review_routes.create_cv_review_service", return_value=_FakeReviewService()),
        patch("src.api.routes.resumes.review_routes.settings", SimpleNamespace(COST_CV_REVIEW=42)),
    ):
        result = asyncio.run(review_resume(payload=payload, session=_FakeSession(None), user=_FakeUser()))

    assert result == {"ok": True}
    assert fake_plan_service.calls == [
        ("has_sufficient_balance", 42),
        ("deduct_tokens", 42, "CV Review Generation"),
    ]
