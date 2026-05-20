from __future__ import annotations

from typing import Any

import bleach
from urllib.parse import urlsplit


_ALLOWED_TAGS: list[str] = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "blockquote",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "span",
    "div",
    "a",
]

_ALLOWED_ATTRIBUTES: dict[str, list[str]] = {
    "a": ["href", "target", "rel"],
    "div": ["class"],
    "span": ["class"],
    "p": ["class"],
}

_ALLOWED_PROTOCOLS: list[str] = ["http", "https", "mailto"]


def sanitize_rich_text_html(value: Any) -> str:
    if value is None:
        return ""
    text = value if isinstance(value, str) else str(value)
    return bleach.clean(
        text,
        tags=_ALLOWED_TAGS,
        attributes=_ALLOWED_ATTRIBUTES,
        protocols=_ALLOWED_PROTOCOLS,
        strip=True,
        strip_comments=True,
    )


def sanitize_url(value: Any) -> str:
    if value is None:
        return ""
    text = value if isinstance(value, str) else str(value)
    raw = text.strip()
    if not raw:
        return ""
    if raw.startswith("//"):
        return raw
    try:
        parsed = urlsplit(raw)
    except Exception:
        return ""
    if parsed.scheme and parsed.scheme.lower() not in _ALLOWED_PROTOCOLS:
        return ""
    return raw


def sanitize_resume_data_inplace(resume_data: dict[str, Any]) -> dict[str, Any]:
    ps = resume_data.get("professionalSummary")
    if isinstance(ps, dict) and "content" in ps:
        ps["content"] = sanitize_rich_text_html(ps.get("content"))

    pd = resume_data.get("personalDetails")
    if isinstance(pd, dict):
        for key in ("website", "linkedin", "github"):
            if key in pd:
                pd[key] = sanitize_url(pd.get(key))

    for key in ("workExperiences", "education", "projects", "awards", "publications"):
        items = resume_data.get(key)
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            if "description" in item:
                item["description"] = sanitize_rich_text_html(item.get("description"))
            if key == "projects" and "link" in item:
                item["link"] = sanitize_url(item.get("link"))
            if key == "publications" and "link" in item:
                item["link"] = sanitize_url(item.get("link"))

    websites = resume_data.get("websites")
    if isinstance(websites, list):
        for item in websites:
            if isinstance(item, dict) and "url" in item:
                item["url"] = sanitize_url(item.get("url"))

    cl = resume_data.get("coverLetter")
    if isinstance(cl, dict) and "content" in cl:
        cl["content"] = sanitize_rich_text_html(cl.get("content"))

    return resume_data
