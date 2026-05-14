from typing import List
from loguru import logger

from src.services.ai.ai_clients_service import AsyncLLMClient, TextProcessor


class JobMatchPromptBuilder:
    @staticmethod
    def build_prompt(job_title: str, job_description: str, resume_text: str) -> str:
        return (
            "You are an expert career coach and ATS specialist.\n"
            "Compare the resume below against the job description and return a detailed match analysis.\n\n"
            "Return ONLY valid JSON with exactly this structure — no markdown, no extra text:\n"
            "{\n"
            '  "match_score": number,          // 0-100 overall fit score\n'
            '  "summary": string,              // 1-2 sentence plain-English explanation of the score\n'
            '  "matched_keywords": [string],   // skills/tools/terms found in BOTH the resume and JD\n'
            '  "missing_keywords": [string],   // skills/tools/terms in the JD that are absent from the resume\n'
            '  "suggestions": [\n'
            '    {\n'
            '      "section": string,          // resume section to improve, e.g. "Skills", "Summary", "Experience"\n'
            '      "suggestion": string,       // specific, actionable advice for that section\n'
            '      "priority": string          // "high", "medium", or "low"\n'
            '    }\n'
            '  ]\n'
            "}\n\n"
            "Rules:\n"
            "- match_score must reflect how well the resume satisfies the role requirements\n"
            "- matched_keywords: list individual terms, not phrases longer than 3 words\n"
            "- missing_keywords: only include terms that genuinely matter for this role\n"
            "- suggestions: 3-5 items ordered by priority descending; be specific, not generic\n"
            "- Do NOT fabricate experience — only suggest adding things the candidate may genuinely have\n\n"
            f"Job Title: {job_title}\n\n"
            "Job Description:\n"
            f'"""\n{job_description}\n"""\n\n'
            "Resume:\n"
            f'"""\n{resume_text}\n"""'
        )


class JobMatchService:
    def __init__(self, client: AsyncLLMClient, model_id: str):
        self._client = client
        self._model_id = model_id

    async def analyse(
        self,
        job_title: str,
        job_description: str,
        resume_text: str,
    ) -> dict:
        prompt = JobMatchPromptBuilder.build_prompt(job_title, job_description, resume_text)

        try:
            raw = await self._client.generate(prompt, self._model_id)
        except Exception as exc:
            logger.error(f"JobMatchService: AI call failed — {exc}")
            raise

        parsed = TextProcessor.extract_json(raw) or {}

        match_score = float(
            min(100.0, max(0.0, TextProcessor.safe_number(parsed.get("match_score", 0))))
        )
        summary = str(parsed.get("summary", "")).strip()
        matched = [str(k).strip() for k in (parsed.get("matched_keywords") or []) if str(k).strip()]
        missing = [str(k).strip() for k in (parsed.get("missing_keywords") or []) if str(k).strip()]
        suggestions = self._parse_suggestions(parsed.get("suggestions") or [])

        return {
            "match_score": match_score,
            "summary": summary,
            "matched_keywords": matched,
            "missing_keywords": missing,
            "suggestions": suggestions,
        }

    @staticmethod
    def _parse_suggestions(raw: list) -> List[dict]:
        valid_priorities = {"high", "medium", "low"}
        result = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            section = str(item.get("section", "")).strip()
            suggestion = str(item.get("suggestion", "")).strip()
            priority = str(item.get("priority", "medium")).strip().lower()
            if priority not in valid_priorities:
                priority = "medium"
            if section and suggestion:
                result.append({"section": section, "suggestion": suggestion, "priority": priority})
        return result
