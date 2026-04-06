FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt
RUN python -m playwright install --with-deps chromium

COPY . /app

RUN mkdir -p /app/logs /app/data

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade heads && python -m src.cli seed && uvicorn src.main:app --host 0.0.0.0 --port 8000"]
