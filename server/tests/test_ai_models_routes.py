import asyncio
import os
import sys
from unittest.mock import patch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.api.routes.ai_models.model_routes import get_ai_models
from src.models.ai_model import AIModel
from src.models.resume import Resume
from src.seeders.resumes import ResumeSeeder


class _FakeScalars:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return list(self._rows)


class _FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        return _FakeScalars(self._rows)


class _FakeSession:
    def __init__(self, rows):
        self._rows = list(rows)

    async def execute(self, stmt):
        exclude_ollama = False
        where_criteria = getattr(stmt, "_where_criteria", ()) or ()
        for crit in where_criteria:
            left = getattr(crit, "left", None)
            right = getattr(crit, "right", None)
            if getattr(left, "name", None) in {"id", "key_id"} and getattr(right, "value", None) == "ollama":
                exclude_ollama = True

        rows = self._rows
        if exclude_ollama:
            rows = [m for m in rows if m.id != "ollama" and m.key_id != "ollama"]

        return _FakeResult(rows)


def test_get_ai_models_excludes_ollama_in_production():
    ollama = AIModel(
        id="ollama",
        name="Ollama",
        description="Run open-source models locally.",
        provider="Ollama",
        key_id="ollama",
    )
    gpt = AIModel(
        id="gpt-4o",
        name="GPT-4o",
        description="OpenAI's flagship model, excellent for reasoning and coding.",
        provider="OpenAI",
        key_id="openai",
    )

    class _Settings:
        DEBUG = False

    db = _FakeSession([ollama, gpt])
    with patch("src.api.routes.ai_models.model_routes.get_settings", return_value=_Settings()):
        result = asyncio.run(get_ai_models(db=db))

    assert [m.id for m in result] == ["gpt-4o"]
