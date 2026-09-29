from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api import auth, users, posts, social_accounts, notifications, audit_logs, dashboard, media, oauth, ai

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Social Media Automation Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(social_accounts.router)
app.include_router(notifications.router)
app.include_router(audit_logs.router)
app.include_router(dashboard.router)
app.include_router(media.router)
app.include_router(oauth.router)
app.include_router(ai.router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}
