import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from src.config import ENV_FILE

load_dotenv(str(ENV_FILE))

def send_email(to_email: str, subject: str, html: str, text: str | None = None):
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", "no-reply@example.com")
    from_name = os.getenv("SMTP_FROM_NAME", "cvrise")
    use_tls = os.getenv("SMTP_USE_TLS", "false").lower() == "true"
    use_starttls = os.getenv("SMTP_USE_STARTTLS", "true").lower() == "true"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email
    if text:
        msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    if not host:
        raise RuntimeError("SMTP_HOST is not configured")

    host = host.strip()
    if host.startswith("."):
        raise RuntimeError("SMTP_HOST is invalid (starts with a dot)")

    if use_tls:
        with smtplib.SMTP_SSL(host=host, port=port, timeout=30) as server:
            if username and password:
                server.login(username, password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(host=host, port=port, timeout=30) as server:
            if use_starttls:
                server.ehlo()
                server.starttls()
                server.ehlo()
            if username and password:
                server.login(username, password)
            server.send_message(msg)
