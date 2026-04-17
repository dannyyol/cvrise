import os
import re
import json
from typing import Dict, List, Optional, Protocol, Any
import httpx
from loguru import logger
from src.services.ai.ai_clients import (
    AsyncLLMClient, OllamaClient, OpenAIClient, 
    AnthropicClient, GoogleClient, TextProcessor
)


class CVReviewConfig:
    def __init__(self, active_model_id: str, provider: str, base_url: str, api_key: Optional[str] = None, model_id_map: Optional[str] = None):
        self.active_model_id = active_model_id
        self.provider = provider
        self.base_url = base_url
        self.api_key = api_key
        self.model_name = model_id_map or active_model_id


class PromptBuilder:
    @staticmethod
    def compose_section_prompt(name: str, content: str) -> str:
        return (
            f"You are a CV reviewer. Analyze the '{name}' section below and provide feedback.\n\n"
            "Return ONLY valid JSON with exactly this structure:\n"
            "{\n"
            f'  "name": "{name}",\n'
            '  "score": number,  // 0-100\n'
            '  "strengths": [string],\n'
            '  "areas_to_improve": [string],\n'
            '  "suggestions": [string]\n'
            "}\n\n"
            "Guidelines:\n"
            "- Score based on relevance, clarity, and impact\n"
            "- Strengths: what works well\n"
            "- Areas to improve: specific weaknesses\n"
            "- Suggestions: actionable improvements\n\n"
            "Do NOT include any text outside the JSON.\n\n"
            f"Section content:\n\"\"\"\n{content}\n\"\"\"\n"
        )
    @staticmethod
    def compose_content_analysis_prompt(content: str) -> str:
        return (
            "You are a CV reviewer. In ONE pass, evaluate the resume for:\n"
            "- ATS Compatibility\n"
            "- Content Quality\n"
            "- Formatting\n\n"
            "Return ONLY valid JSON with exactly this structure:\n"
            "{\n"
            '  "atsCompatibility": {\n'
            '    "score": number,  // 0-100\n'
            '    "summary": [string]\n'
            "  },\n"
            '  "contentQuality": {\n'
            '    "score": number,  // 0-100\n'
            '    "summary": [string]\n'
            "  },\n"
            '  "formattingAnalysis": {\n'
            '    "score": number,  // 0-100\n'
            '    "summary": [string]\n'
            "  }\n"
            "}\n\n"
            "Guidelines:\n"
            "- ATS: section headings, simple formatting, keyword use, clear titles\n"
            "- Content: measurable outcomes, specificity, coverage of key sections, action verbs\n"
            "- Formatting: consistency in headings, bullets, whitespace, punctuation, date ranges\n\n"
            "Provide concise bullet-style strings for each summary. Do NOT include any text outside the JSON.\n\n"
            "Resume to analyze:\n"
            f"\"\"\"\n{content}\n\"\"\"\n"
        )


class SectionAnalyzer:
    def __init__(self, llm_client: AsyncLLMClient):
        self.llm_client = llm_client
    async def analyze_section(self, name: str, content: str, model: str) -> dict:
        try:
            prompt = PromptBuilder.compose_section_prompt(name, content)
            response_text = await self.llm_client.generate(prompt, model)
            parsed = TextProcessor.extract_json(response_text) or {}
            return {
                "name": parsed.get("name", name),
                "score": TextProcessor.safe_number(parsed.get("score", 0)),
                "strengths": list(map(str, parsed.get("strengths", []))),
                "areas_to_improve": list(map(str, parsed.get("areas_to_improve", []))),
                "suggestions": list(map(str, parsed.get("suggestions", []))),
            }
        except Exception as exc:
            logger.warning("Section analysis failed for '{}': {}", name, str(exc))
            return {"name": name, "score": 0.0, "strengths": [], "areas_to_improve": [], "suggestions": []}


class ResumeProcessor:
    @staticmethod
    def _join_nonempty(parts):
        return "\n".join([p for p in parts if p and str(p).strip()])
    @staticmethod
    def flatten_resume_sections(sections_payload: dict) -> Dict[str, str]:
        sections_payload = sections_payload or {}
        prof = sections_payload.get("professionalSummary") or {}
        summary = prof.get("content") or ""
        exp_items = sections_payload.get("workExperiences") or []
        exp_parts: List[str] = []
        for item in exp_items:
            title = item.get("position", "")
            company = item.get("company", "")
            location = item.get("location", "")
            start = item.get("startDate", "")
            end = item.get("endDate", "")
            current = item.get("current", False)
            date_range = f"{start}–{'Present' if current else end}".strip("–")
            header = ", ".join([p for p in [title, company] if p])
            tail = " — ".join([p for p in [location, date_range] if p])
            line1 = " — ".join([p for p in [header, tail] if p])
            desc = item.get("description", "")
            exp_parts.append(ResumeProcessor._join_nonempty([line1, desc]).strip())
        experience = "\n\n".join([p for p in exp_parts if p])
        edu_items = sections_payload.get("education") or []
        edu_parts: List[str] = []
        for item in edu_items:
            degree = item.get("degree", "")
            field = item.get("fieldOfStudy", "")
            inst = item.get("institution", "")
            start = item.get("startDate", "")
            end = item.get("endDate", "")
            line = ", ".join([p for p in [degree, field] if p])
            tail = " — ".join([p for p in [inst, f"{start}–{end}".strip('–')] if p])
            edu_parts.append(ResumeProcessor._join_nonempty([" ".join([line, tail]).strip()]))
        education = "\n\n".join([p for p in edu_parts if p])
        skill_items = sections_payload.get("skills") or []
        skills = ", ".join([s.get("name", "") + (f" ({s.get('level')})" if s.get("level") else "") for s in skill_items if s.get("name")])
        proj_items = sections_payload.get("projects") or []
        proj_parts: List[str] = []
        for item in proj_items:
            title = item.get("name", "")
            desc = item.get("description", "")
            start = item.get("startDate", "")
            end = item.get("endDate", "")
            url = item.get("link", "")
            line = " — ".join([p for p in [title, desc] if p])
            tail = " ".join([p for p in [f"({start}–{end})".strip('()–'), url] if p])
            proj_parts.append(ResumeProcessor._join_nonempty([line, tail]).strip())
        projects = "\n\n".join([p for p in proj_parts if p])
        cert_items = sections_payload.get("certifications") or []
        cert_parts: List[str] = []
        for item in cert_items:
            name = item.get("name", "")
            issuer = item.get("issuer", "")
            issue_date = item.get("issueDate", "")
            expiry_date = item.get("expiryDate", "")
            line = " — ".join([p for p in [name, issuer] if p])
            tail = f"{issue_date}–{expiry_date}".strip("–")
            cert_parts.append(ResumeProcessor._join_nonempty([line, tail]).strip())
        certifications = "\n\n".join([p for p in cert_parts if p])
        lang_items = sections_payload.get("languages") or []
        lang_parts: List[str] = []
        for item in lang_items:
            language = item.get("language", "")
            proficiency = item.get("proficiency", "")
            entry = " — ".join([p for p in [language, proficiency] if p]).strip()
            if entry:
                lang_parts.append(entry)
        languages = ", ".join([p for p in lang_parts if p])
        award_items = sections_payload.get("awards") or []
        award_parts: List[str] = []
        for item in award_items:
            title = item.get("title", "")
            issuer = item.get("issuer", "")
            year = item.get("date", "")
            description = item.get("description", "")
            line = " — ".join([p for p in [title, issuer] if p])
            tail = " ".join([p for p in [year, description] if p])
            award_parts.append(ResumeProcessor._join_nonempty([line, tail]).strip())
        awards = "\n\n".join([p for p in award_parts if p])
        pub_items = sections_payload.get("publications") or []
        pub_parts: List[str] = []
        for item in pub_items:
            title = item.get("title", "")
            publisher = item.get("publisher", "")
            year = item.get("date", "")
            raw_url = item.get("link", "")
            url = str(raw_url).replace("`", "").strip()
            line = " — ".join([p for p in [title, publisher] if p])
            tail = " ".join([p for p in [f"({year})".strip('()'), url] if p])
            pub_parts.append(ResumeProcessor._join_nonempty([line, tail]).strip())
        publications = "\n\n".join([p for p in pub_parts if p])
        result: Dict[str, str] = {}
        if summary: result["Summary"] = summary
        if experience: result["Experience"] = experience
        if education: result["Education"] = education
        if skills: result["Skills"] = skills
        if projects: result["Projects"] = projects
        if certifications: result["Certifications"] = certifications
        if publications: result["Publications"] = publications
        if awards: result["Awards"] = awards
        if languages: result["Languages"] = languages
        return result
        
    @staticmethod
    def build_resume_text_from_nested(sections_payload: dict) -> str:
        sections_payload = sections_payload or {}
        flat = ResumeProcessor.flatten_resume_sections(sections_payload)
        order = ["Summary", "Experience", "Education", "Skills", "Projects", "Certifications", "Publications", "Awards", "Languages"]
        lines: List[str] = []
        for name in order:
            content = flat.get(name, "").strip()
            if content:
                lines.append(f"{name}\n{content}")
        for name, content in flat.items():
            if name not in order and content.strip():
                lines.append(f"{name}\n{content.strip()}")
        return "\n\n".join(lines).strip()

class ContentAnalyzer:
    def __init__(self, llm_client: AsyncLLMClient):
        self.llm_client = llm_client
    async def analyze_resume_content(self, resume_text: str, model: str) -> dict:
        try:
            prompt = PromptBuilder.compose_content_analysis_prompt(resume_text)
          
            response_text = await self.llm_client.generate(prompt, model)
            parsed = TextProcessor.extract_json(response_text) or {}
            ats = parsed.get("atsCompatibility", {}) or {}
            cq = parsed.get("contentQuality", {}) or {}
            fmt = parsed.get("formattingAnalysis", {}) or {}
            return {
                "atsCompatibility": {"score": TextProcessor.safe_number(ats.get("score", 0)), "summary": list(map(str, ats.get("summary", [])))},
                "contentQuality": {"score": TextProcessor.safe_number(cq.get("score", 0)), "summary": list(map(str, cq.get("summary", [])))},
                "formattingAnalysis": {"score": TextProcessor.safe_number(fmt.get("score", 0)), "summary": list(map(str, fmt.get("summary", [])))},
            }
        except Exception as exc:
            logger.warning("Combined analysis failed; falling back to separate calls: {}", str(exc))
            return {
                "atsCompatibility": {"score": 0.0, "summary": []},
                "contentQuality": {"score": 0.0, "summary": []},
                "formattingAnalysis": {"score": 0.0, "summary": []},
            }


class CVReviewService:
    def __init__(self, llm_client: AsyncLLMClient, config: CVReviewConfig):
        self.llm_client = llm_client
        self.config = config
        self.section_analyzer = SectionAnalyzer(llm_client)
        self.content_analyzer = ContentAnalyzer(llm_client)
    def _weighted_section_score(self, sections: List[dict]) -> float:
        weights = {
            "Summary": 0.10,
            "Experience": 0.35,
            "Education": 0.15,
            "Skills": 0.20,
            "Projects": 0.10,
        }
        default_weight = 0.10
        total_w = 0.0
        accum = 0.0
        for s in sections:
            name = str(s.get("name", "")).strip()
            score = TextProcessor.safe_number(s.get("score", 0), 0.0)
            w = weights.get(name, default_weight)
            accum += score * w
            total_w += w
        return round(accum / total_w, 1) if total_w > 0 else 0.0

    async def review_cv_from_sections(self, sections: Dict[str, str], model: Optional[str] = None) -> dict:
        model = model or self.config.model_name
        
        analyzed: List[dict] = []
        for name in sections:
            if name in sections and sections[name].strip():
                analyzed.append(await self.section_analyzer.analyze_section(name, sections[name], model))
        if not analyzed:
            analyzed.append(await self.section_analyzer.analyze_section("Summary", "\n".join(sections.values()), model))
        strengths: List[str] = []
        improvements: List[str] = []
        final_sections: List[dict] = []
        for sec in analyzed:
            final_sections.append({"name": sec["name"], "score": TextProcessor.safe_number(sec["score"], 0), "suggestions": sec.get("suggestions", [])})
            strengths.extend(sec.get("strengths", []))
            improvements.extend(sec.get("areas_to_improve", []))
        overall = self._weighted_section_score(final_sections)
        return {
            "overall_score": overall,
            "strengths": sorted({s.strip() for s in strengths if s.strip()}),
            "areas_to_improve": sorted({a.strip() for a in improvements if a.strip()}),
            "sections": final_sections,
        }

    async def review_cv_payload(self, payload: dict) -> dict:
        model = self.config.model_name
        
        resume_text_full = ResumeProcessor.build_resume_text_from_nested(payload)
        combined = await self.content_analyzer.analyze_resume_content(resume_text_full or "", model)
        ats = combined.get("atsCompatibility", {"score": 0.0, "summary": []})
        content_quality = combined.get("contentQuality", {"score": 0.0, "summary": []})
        fmt_analysis = combined.get("formattingAnalysis", {"score": 0.0, "summary": []})
        sections = ResumeProcessor.flatten_resume_sections(payload)
        base = await self.review_cv_from_sections(sections, model=model)

        section_overall = TextProcessor.safe_number(base.get("overall_score", 0.0), 0.0)
        ats_score = TextProcessor.safe_number(ats.get("score", 0.0), 0.0)
        cq_score = TextProcessor.safe_number(content_quality.get("score", 0.0), 0.0)
        fmt_score = TextProcessor.safe_number(fmt_analysis.get("score", 0.0), 0.0)

        dim_blend = (0.25 * ats_score) + (0.50 * cq_score) + (0.25 * fmt_score)
        penalty = 0.0
        if not sections.get("Experience"): penalty += 8.0
        if not sections.get("Skills"): penalty += 5.0
        if not sections.get("Education"): penalty += 4.0

        final_overall = max(0.0, min(100.0, round((0.60 * section_overall) + (0.40 * dim_blend) - penalty, 1)))

        base["overall_score"] = final_overall
        base["atsCompatibility"] = ats
        base["contentQuality"] = content_quality
        base["formattingAnalysis"] = fmt_analysis
        return base

def create_cv_review_service(client: AsyncLLMClient, model_id: str) -> CVReviewService:
    config = CVReviewConfig(
        active_model_id="dynamic",
        provider="dynamic",
        base_url="",
        api_key="",
        model_id_map=model_id
    )
    return CVReviewService(client, config)
