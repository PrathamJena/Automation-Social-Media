from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from datetime import datetime
from app.database import get_db
from app.models.post import Post, PostMedia, PostPlatform, PostStatus
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.api.deps import get_current_user, require_role
from app.workers.scheduler import publish_post

router = APIRouter(prefix="/api/posts", tags=["Posts"])


@router.get("/", response_model=List[PostResponse])
def list_posts(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Post)
    if status:
        query = query.filter(Post.status == status)
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts


@router.post("/", response_model=PostResponse)
def create_post(
    request: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "EDITOR")),
):
    post_status = PostStatus.DRAFT
    if request.scheduled_at:
        post_status = PostStatus.SCHEDULED

    post = Post(
        created_by=current_user.id,
        caption=request.caption,
        status=post_status,
        scheduled_at=request.scheduled_at,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # Attach uploaded media so the post is not media-less
    if request.file_url:
        media = PostMedia(
            post_id=post.id,
            file_url=request.file_url,
            file_type=request.file_type or "image/jpeg",
            file_name=request.file_name or "upload",
            file_size=request.file_size,
        )
        db.add(media)

    for platform in request.platforms or []:
        db.add(PostPlatform(post_id=post.id, platform=platform))

    db.commit()
    db.refresh(post)
    return post


@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: str,
    request: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "EDITOR")),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if request.caption is not None:
        post.caption = request.caption
    if request.scheduled_at is not None:
        post.scheduled_at = request.scheduled_at
        post.status = PostStatus.SCHEDULED
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/publish")
def publish_now(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "EDITOR")),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = PostStatus.PUBLISHING
    db.commit()

    # Queue for immediate publishing
    publish_post.delay(str(post.id))

    return {"message": "Post queued for publishing"}


@router.delete("/{post_id}")
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN", "EDITOR")),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Remove children first to satisfy foreign key constraints
    db.query(PostMedia).filter(PostMedia.post_id == post_id).delete()
    db.query(PostPlatform).filter(PostPlatform.post_id == post_id).delete()
    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}
