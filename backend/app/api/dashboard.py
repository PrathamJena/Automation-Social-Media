from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.post import Post, PostStatus
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_posts = db.query(func.count(Post.id)).scalar() or 0
    scheduled = db.query(func.count(Post.id)).filter(Post.status == PostStatus.SCHEDULED).scalar() or 0
    published = db.query(func.count(Post.id)).filter(Post.status == PostStatus.PUBLISHED).scalar() or 0
    failed = db.query(func.count(Post.id)).filter(Post.status == PostStatus.FAILED).scalar() or 0
    drafts = db.query(func.count(Post.id)).filter(Post.status == PostStatus.DRAFT).scalar() or 0

    return {
        "total_posts": total_posts,
        "scheduled": scheduled,
        "published": published,
        "failed": failed,
        "drafts": drafts,
    }
