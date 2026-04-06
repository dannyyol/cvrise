from jinja2 import Environment, FileSystemLoader, select_autoescape
from src.config import BASE_DIR

template_dir = BASE_DIR / "src" / "templates" / "emails"
env = Environment(
    loader=FileSystemLoader(str(template_dir)),
    autoescape=select_autoescape(["html", "xml"]),
)

def render_template(name: str, context: dict) -> str:
    template = env.get_template(name)
    return template.render(**context)
