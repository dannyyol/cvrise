import asyncio
import os
import sys

import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.services.ai.ai_clients_service import AIConfigurationError, AIProviderError
from src.services.resumes.review_service import ContentAnalyzer, SectionAnalyzer


class _FailingClient:
    def __init__(self, exc: Exception):
        self._exc = exc

    async def generate(self, _prompt: str, _model: str) -> str:
        raise self._exc


def test_section_analyzer_reraises_ai_provider_error():
    analyzer = SectionAnalyzer(_FailingClient(AIProviderError("down")))
    with pytest.raises(AIProviderError):
        asyncio.run(analyzer.analyze_section("Summary", "text", "model"))


def test_content_analyzer_reraises_ai_configuration_error():
    analyzer = ContentAnalyzer(_FailingClient(AIConfigurationError("bad key")))
    with pytest.raises(AIConfigurationError):
        asyncio.run(analyzer.analyze_resume_content("text", "model"))
