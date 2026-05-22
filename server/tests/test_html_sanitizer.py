from src.utils.html_sanitizer import sanitize_rich_text_html, sanitize_resume_data_inplace, sanitize_url


def test_sanitize_rich_text_html_strips_scripts_and_event_handlers():
    html = '<p>Hello<img src=x onerror="alert(1)"></p><script>alert(2)</script>'
    cleaned = sanitize_rich_text_html(html)
    assert "<script" not in cleaned.lower()
    assert "onerror" not in cleaned.lower()
    assert "<img" not in cleaned.lower()


def test_sanitize_rich_text_html_blocks_javascript_urls():
    html = '<a href="javascript:alert(1)">click</a>'
    cleaned = sanitize_rich_text_html(html)
    assert "javascript:" not in cleaned.lower()


def test_sanitize_resume_data_inplace_cleans_nested_fields():
    resume_data = {
        "personalDetails": {"website": "javascript:alert(1)", "linkedin": "https://linkedin.com/in/x"},
        "professionalSummary": {"content": '<p>Hi<script>alert(1)</script></p>'},
        "workExperiences": [{"description": '<img src=x onerror="alert(1)">ok'}],
        "education": [{"description": "<p>edu</p>"}],
        "projects": [{"description": '<a href="javascript:alert(1)">x</a>', "link": "javascript:alert(1)"}],
        "awards": [{"description": "<div>award</div>"}],
        "publications": [{"description": "<span>pub</span>", "link": "data:text/html,hi"}],
        "websites": [{"url": "vbscript:alert(1)"}],
        "coverLetter": {"content": '<p>cl<img src=x onerror="alert(1)"></p>'},
    }
    sanitize_resume_data_inplace(resume_data)
    assert "<script" not in resume_data["professionalSummary"]["content"].lower()
    assert "onerror" not in resume_data["workExperiences"][0]["description"].lower()
    assert "javascript:" not in resume_data["projects"][0]["description"].lower()
    assert "onerror" not in resume_data["coverLetter"]["content"].lower()
    assert resume_data["personalDetails"]["website"] == ""
    assert resume_data["personalDetails"]["linkedin"] == "https://linkedin.com/in/x"
    assert resume_data["projects"][0]["link"] == ""
    assert resume_data["publications"][0]["link"] == ""
    assert resume_data["websites"][0]["url"] == ""


def test_sanitize_url_allows_http_https_mailto_and_blocks_other_schemes():
    assert sanitize_url("https://example.com") == "https://example.com"
    assert sanitize_url("http://example.com") == "http://example.com"
    assert sanitize_url("mailto:test@example.com") == "mailto:test@example.com"
    assert sanitize_url("javascript:alert(1)") == ""
    assert sanitize_url("data:text/html,hi") == ""
