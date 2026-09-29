FROM python:3.11-slim

# Fail fast and get readable errors instead of hanging.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# curl is used by the container healthcheck.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as a non-root user.
RUN useradd --create-home --shell /usr/sbin/nologin aksidhi \
    && mkdir -p /app/media \
    && chown -R aksidhi:aksidhi /app
USER aksidhi

EXPOSE 8000

# Some hosts (Railway, Render, Fly) inject a PORT and route public
# traffic to it, so the app must bind that rather than a fixed number.
# Default keeps `docker compose` working unchanged.
ENV PORT=8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl --fail --silent "http://127.0.0.1:${PORT}/health" || exit 1

# Apply migrations, then serve. No --reload in production.
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
