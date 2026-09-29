# AakSidhi Automation

A premium social media automation platform for scheduling, publishing, and managing content across multiple platforms.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, TanStack Query
- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL
- **Background Jobs**: Redis, Celery
- **Storage**: S3-compatible (MinIO for local dev)

## Quick Start

### Using Docker (Recommended)

```bash
# Clone and navigate to project
cd AakSidhi\ Automation

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp ../.env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Environment Variables

See `.env.example` for all required configuration.

## Project Structure

```
AakSidhi Automation/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Config, security
│   │   ├── database/      # SQLAlchemy setup
│   │   ├── integrations/  # Social platform adapters
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── workers/       # Celery tasks
│   │   └── utils/         # Utilities
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/           # API clients
│   │   ├── components/    # Reusable components
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Page components
│   │   ├── stores/        # State management
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Features

- User authentication with JWT
- Role-based access control (Admin, Editor, Viewer)
- Create and schedule social media posts
- Media upload and management
- Social account integration (Facebook, Instagram, LinkedIn, WhatsApp)
- Analytics dashboard
- Audit logging
- AI caption assistant (Ollama)

## License

Proprietary
