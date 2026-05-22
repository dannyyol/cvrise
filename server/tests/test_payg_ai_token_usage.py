import asyncio
import os
import sys
from types import SimpleNamespace
from unittest.mock import patch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.models.settings import Setting
from src.models.ai_model import AIModel
from src.services.ai.ai_clients_service import OpenAIClient
from src.services.settings.ai_service import get_configured_ai_client
from src.api.routes.resumes.review_routes import review_resume


class _FakeScalarResult:
    def __init__(self, value):
        self._value = value

    def scalar_one_or_none(self):
        return self._value


class _FakeSession:
    def __init__(self, settings: list[Setting] | None = None, ai_models: list[AIModel] | None = None):
        self._settings = list(settings or [])
        self._ai_models = list(ai_models or [])

    async def execute(self, stmt):
        where_criteria = getattr(stmt, "_where_criteria", ()) or ()

        table_names: set[str] = set()
        filters: dict[str, object] = {}

        for crit in where_criteria:
            left = getattr(crit, "left", None)
            right = getattr(crit, "right", None)
            if left is None or right is None:
                continue

            table = getattr(left, "table", None)
            table_name = getattr(table, "name", None)
            if isinstance(table_name, str):
                table_names.add(table_name)

            left_name = getattr(left, "name", None)
            right_value = getattr(right, "value", None)
            if isinstance(left_name, str):
                filters[left_name] = right_value

        if "settings" in table_names:
            for setting in self._settings:
                if filters.get("user_id") is not None and setting.user_id != filters.get("user_id"):
                    continue
                if filters.get("key") is not None and setting.key != filters.get("key"):
                    continue
                return _FakeScalarResult(setting)
            return _FakeScalarResult(None)

        if "ai_models" in table_names:
            for model in self._ai_models:
                if filters.get("id") is not None and model.id != filters.get("id"):
                    continue
                return _FakeScalarResult(model)
            return _FakeScalarResult(None)

        return _FakeScalarResult(None)


def test_get_configured_ai_client_platform_mode_uses_platform_ai_key():
    db = _FakeSession(
        settings=[
            Setting(
                user_id="user-1",
                key="ai_config",
                value={
                    "usageMode": "platform",
                },
            )
        ]
    )

    class _AppSettings:
        PLATFORM_OPENAI_API_KEY = "platform-key"
        PLATFORM_OPENAI_MODEL = "gpt-platform"

    with patch("src.services.settings.ai_service.get_settings", return_value=_AppSettings()):
        client, model_id, is_platform_mode = asyncio.run(get_configured_ai_client(db, "user-1"))

    assert is_platform_mode is True
    assert model_id == "gpt-platform"
    assert isinstance(client, OpenAIClient)
    assert client.base_url == "https://api.openai.com/v1"
    assert client.api_key == "platform-key"


def test_get_configured_ai_client_custom_mode_uses_logged_in_users_ai_api_key():
    db = _FakeSession(
        settings=[
            Setting(
                user_id="user-1",
                key="ai_config",
                value={
                    "usageMode": "custom",
                    "activeModelId": "gpt-4o",
                    "configs": {
                        "openai": {
                            "apiKey": "user-key",
                            "baseUrl": "https://example.ai/v1",
                            "modelId": "gpt-4o-mini",
                        }
                    },
                },
            )
        ],
        ai_models=[
            AIModel(
                id="gpt-4o",
                name="GPT-4o",
                description="Test model",
                provider="OpenAI",
                key_id="openai",
            )
        ],
    )

    class _AppSettings:
        PLATFORM_OPENAI_API_KEY = "platform-key"
        PLATFORM_OPENAI_MODEL = "gpt-platform"

    with patch("src.services.settings.ai_service.get_settings", return_value=_AppSettings()):
        client, model_id, is_platform_mode = asyncio.run(get_configured_ai_client(db, "user-1"))

    assert is_platform_mode is False
    assert isinstance(client, OpenAIClient)
    assert client.api_key == "user-key"
    assert client.base_url == "https://example.ai/v1"
    assert model_id == "gpt-4o-mini"


def test_openai_generate_sends_authorization_header_with_users_key_in_custom_mode():
    captured: dict[str, object] = {}

    class _FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"choices": [{"message": {"content": "ok"}}]}

    class _FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, url, headers=None, json=None):
            captured["url"] = url
            captured["headers"] = headers or {}
            captured["json"] = json or {}
            return _FakeResponse()

    client = OpenAIClient(base_url="https://example.ai/v1", api_key="user-key")

    with patch("src.services.ai.ai_clients_service.httpx.AsyncClient", _FakeAsyncClient):
        result = asyncio.run(client.generate(prompt="hello", model="gpt-4o-mini"))

    assert result == "ok"
    assert captured["headers"]["Authorization"] == "Bearer user-key"


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
        result = asyncio.run(review_resume(payload=payload, session=_FakeSession(), user=_FakeUser()))

    assert result == {"ok": True}
    assert fake_plan_service.calls == [
        ("has_sufficient_balance", 42),
        ("deduct_tokens", 42, "CV Review Generation"),
    ]
