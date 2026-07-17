"""Skill group helpers — category + items[] with legacy {name, level} support."""

from __future__ import annotations

import re
import uuid
from typing import Any, Dict, List

_PROFICIENCY_RE = re.compile(
    r"^(beginner|intermediate|advanced|expert|familiar|good|native|fluent|proficient|basic|novice)"
    r"(\s*[-–/]\s*\w+)?$",
    re.I,
)
_RATING_RE = re.compile(r"^\d+\s*/\s*\d+$")


def _split_items(value: str) -> List[str]:
    return [part.strip() for part in re.split(r"[,;|]", value) if part.strip()]


def _looks_like_proficiency(value: str) -> bool:
    v = value.strip()
    if not v:
        return False
    return bool(_PROFICIENCY_RE.match(v) or _RATING_RE.match(v))


def normalize_skill(raw: Any) -> Dict[str, Any]:
    record = raw if isinstance(raw, dict) else {}
    skill_id = str(record.get("id") or uuid.uuid4())
    level_raw = str(record.get("level") or "").strip()

    if isinstance(record.get("items"), list):
        return {
            "id": skill_id,
            "name": str(record.get("name") or "").strip(),
            "items": [str(i).strip() for i in record["items"] if str(i).strip()],
            "level": level_raw,
        }

    name = str(record.get("name") or "").strip()

    if (
        name
        and level_raw
        and not _looks_like_proficiency(level_raw)
        and ("," in level_raw or ";" in level_raw or len(level_raw.split()) > 3)
    ):
        return {"id": skill_id, "name": name, "items": _split_items(level_raw), "level": ""}

    if "," in name or ";" in name:
        return {
            "id": skill_id,
            "name": "",
            "items": _split_items(name),
            "level": level_raw if _looks_like_proficiency(level_raw) else "",
        }

    return {
        "id": skill_id,
        "name": "",
        "items": [name] if name else [],
        "level": level_raw,
    }


def normalize_skills(skills: Any) -> List[Dict[str, Any]]:
    if not isinstance(skills, list):
        return []
    result = []
    for raw in skills:
        skill = normalize_skill(raw)
        if skill["items"] or skill["name"]:
            result.append(skill)
    return result


def format_skill_group_text(skill: Dict[str, Any]) -> str:
    category = str(skill.get("name") or "").strip()
    items = [str(i).strip() for i in (skill.get("items") or []) if str(i).strip()]
    level = str(skill.get("level") or "").strip()

    if category and items:
        body = ", ".join(items)
        return f"{category}: {body} ({level})" if level else f"{category}: {body}"
    if items:
        body = ", ".join(items)
        return f"{body} ({level})" if level else body
    if category:
        return f"{category} ({level})" if level else category
    return ""


def flatten_skills_text(skills: Any) -> str:
    parts = [format_skill_group_text(s) for s in normalize_skills(skills)]
    return "\n".join(p for p in parts if p)


def collect_skill_item_names(skills: Any) -> set[str]:
    names: set[str] = set()
    for skill in normalize_skills(skills):
        for item in skill.get("items") or []:
            name = str(item).strip().lower()
            if name:
                names.add(name)
        # Also include category-less legacy single names already in items
        category = str(skill.get("name") or "").strip().lower()
        if category and not skill.get("items"):
            names.add(category)
    return names
