# AakSidhi Automation

A premium social media automation platform for planning, scheduling and
publishing content across Facebook, Instagram, LinkedIn and WhatsApp Business.

Built with role-based access control, a background publishing queue, an
optional local AI assistant, and a dark-first design system with a light theme.

> **Publishing uses official platform APIs and OAuth only.**
> No browser automation, credential scraping, or unofficial endpoints.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Running the tests](#running-the-tests)
- [Deploying](#deploying)
- [AI assistant](#ai-assistant-optional)
- [Connecting social accounts](#connecting-social-accounts)
- [Sharing the app](#sharing-the-app)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Features

| Area | What it does |
| --- | --- |
| **Auth** | JWT access + refresh tokens, Argon2 password hashing, ADMIN / EDITOR / VIEWER roles |
| **Composer** | Drag-and-drop media, caption with live count, hashtags, multi-platform selection, live preview |
| **Scheduling** | Month / week / day calendar, timezone-aware scheduling, pick a day to start a post |
| **Queue** | Celery workers, automatic retries with backoff, idempotent publishing |
| **Accounts** | Official OAuth for Meta, LinkedIn and WhatsApp Business with encrypted token storage |
| **AI** | Optional local caption writing and image analysis via Ollama |
| **Insight** | Analytics, notifications, audit log of every action |
| **Design** | Dark-first glass design system, light theme, responsive, keyboard accessible |

---

## Tech stack

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, Framer Motion,
TanStack Query, Lucide icons, Vitest

**Backend** — Python 3.11, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2

**Data & jobs** — PostgreSQL 16, Redis 7, Celery (worker + beat)

**Storage** — S3-compatible abstraction (AWS S3, Cloudflare R2, Supabase
Storage). Falls back to local filesystem when no endpoint is configured.

---

## Quick start

### Prerequisites

- Docker Desktop installed and running
- Roughly 4 GB of free RAM

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd aaksidhi-automation

# Create your local environment file
cp .env.example .env      # Windows: copy .env.example .env
```

Generate a signing secret and paste it into `SECRET_KEY` in `.env`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 2. Start everything

```bash
docker compose up -d
```

### 3. Create the database and an admin user

```bash
# Apply migrations
docker compose exec backend alembic upgrade head

# Create the first admin account
docker compose exec backend python -m app.scripts.seed_admin
```

### 4. Open the app

| Service | URL |
| --- | --- |
| Web app | http://localhost:5173 |
| API docs | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |

Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`
(the defaults are `admin@company.com` / `admin123`).

---

## Configuration

All configuration lives in `.env`. See [`.env.example`](.env.example) for
the fully commented list. The settings you are most likely to change:

| Variable | Purpose |
| --- | --- |
| `SECRET_KEY` | Signs access tokens. **Must be unique per deployment.** |
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Password for the seeded admin user |
| `CORS_ORIGINS` | Comma-separated list of allowed browser origins |
| `S3_ENDPOINT` | Leave empty for local file storage |
| `OLLAMA_BASE_URL` | Where to reach your local Ollama instance |

---

## Project structure

```
.
├── backend/
│   ├── alembic.ini
│   ├── migrations/            # Alembic migration history
│   ├── app/
│   │   ├── api/                # HTTP routes (auth, posts, media, ai, oauth…)
│   │   ├── core/               # Settings, password hashing, JWT
│   │   ├── database/           # Engine, session, Base
│   │   ├── integrations/       # Per-platform OAuth adapters
│   │   │   ├── base.py         # SocialPlatformAdapter interface
│   │   │   ├── meta/           # Facebook + Instagram
│   │   │   ├── linkedin/
│   │   │   └── whatsapp/
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic request/response models
│   │   ├── scripts/            # Maintenance scripts (seed_admin)
│   │   ├── services/           # Storage, AI provider
│   │   ├── utils/              # Token encryption
│   │   ├── workers/            # Celery tasks + beat schedule
│   │   └── main.py
│   └── tests/                  # pytest suite
├── frontend/
│   ├── src/
│   │   ├── api/                # Typed API clients
│   │   ├── components/         # UI components
│   │   ├── contexts/           # Auth + theme providers
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── stores/             # Zustand auth store
│   │   ├── __tests__/          # Vitest suite
│   │   └── index.css           # Design tokens + component layer
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Running the tests

```bash
# Backend (29 tests)
docker compose exec backend pip install -r requirements-dev.txt
docker compose exec backend python -m pytest tests/ -v

# Frontend (11 tests)
cd frontend && npm install && npm test
```

---

## AI assistant (optional)

The AI features are entirely optional. **If Ollama is not running, every other
feature keeps working.**

```bash
# Install Ollama from https://ollama.com
ollama pull qwen3.5:4b   # text captions
ollama pull llava        # reads uploaded images
```

From inside Docker, Ollama on your machine is reachable at
`http://host.docker.internal:11434` (already the default in `.env.example`).

---

## Connecting social accounts

Each platform needs an app registered in its developer console. Add the
credentials to `.env`, then connect from **Social Accounts** in the UI.

| Platform | Where to register | Scopes needed |
| --- | --- | --- |
| Facebook | [Meta for Developers](https://developers.facebook.com) | `pages_manage_posts`, `pages_read_engagement` |
| Instagram | Same Meta app | `instagram_basic`, `instagram_content_publish` |
| LinkedIn | [LinkedIn Developers](https://www.linkedin.com/developers) | `r_liteprofile`, `w_member_social` |
| WhatsApp Business | [Meta for Developers](https://developers.facebook.com) | Business messaging via Cloud API |

Add the redirect URI shown in `.env.example` to your app's allowed list.

**Note on WhatsApp:** the official Cloud API supports business *messaging*.
There is no supported API for publishing WhatsApp Status updates, so this
project does not pretend otherwise.

---

## Sharing the app

To show the running app to someone on another laptop, a Cloudflare quick
tunnel is included:

```bash
docker compose --profile tunnel up -d tunnel
docker compose logs tunnel | grep trycloudflare
```

That prints a public HTTPS URL. Only the frontend port is published, so the
database and Redis stay private.

> The quick-tunnel URL changes every time it restarts. For a permanent
> address, create a named tunnel with a free Cloudflare account.
> Read the security notes below before exposing the app.

---

## Security

- Passwords hashed with Argon2; never stored or logged in plain text
- Short-lived access tokens plus rotating refresh tokens
- Role-based authorisation enforced server-side on every route
- OAuth `state` validated against Redis with a 10-minute expiry
- Social access tokens encrypted at rest with Fernet
- SQL injection prevented by parameterised SQLAlchemy queries
- Strict CORS allow-list
- Uploads validated by MIME type and size
- `SECRET_KEY` has **no usable default** — the app refuses to start in
  production if it is missing, still the placeholder, or under 32 characters

Before exposing this to the internet, set a strong `ADMIN_PASSWORD` and a
unique `SECRET_KEY`.

---

## Troubleshooting

**Port already in use**
Change the host side of the port mapping in `docker-compose.yml`, e.g.
`"5174:5173"`.

**`relation "users" does not exist`**
Migrations have not been run:
```bash
docker compose exec backend alembic upgrade head
```

**Login returns 401 after changing `SECRET_KEY`**
Existing tokens were signed with the old key. Sign in again to get new ones.

**AI assistant says it is unavailable**
Ollama is not reachable. Check it runs on the host
(`ollama serve`) and that `OLLAMA_BASE_URL` is correct.

**Blank screen in the browser**
Hard-refresh with `Ctrl + Shift + R`. If you are using the tunnel, also make
sure `CORS_ORIGINS` includes the public hostname.

**Reset everything and start clean**
```bash
docker compose down -v      # -v also deletes the database volume
docker compose up -d
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.scripts.seed_admin
```

---

## License

Proprietary. All rights reserved.
