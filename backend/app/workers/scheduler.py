from datetime import datetime
from sqlalchemy import and_
from app.workers.celery_app import celery_app
from app.database import SessionLocal
from app.models.post import Post, PostStatus, PostPlatform
from app.models.social_account import SocialAccount, AccountStatus
from app.models.notification import Notification, NotificationType
from app.utils.encryption import decrypt_token


@celery_app.task
def check_scheduled_posts():
    """Check for posts that are due for publishing and queue them."""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        posts = (
            db.query(Post)
            .filter(
                and_(
                    Post.status == PostStatus.SCHEDULED,
                    Post.scheduled_at <= now,
                )
            )
            .all()
        )

        for post in posts:
            # Idempotency check: skip if already publishing or published
            if post.status in [PostStatus.PUBLISHING, PostStatus.PUBLISHED]:
                continue

            post.status = PostStatus.PUBLISHING
            db.commit()

            # Queue the publishing task
            publish_post.delay(str(post.id))

        return f"Queued {len(posts)} posts for publishing"
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def publish_post(self, post_id: str):
    """Publish a post to all selected platforms."""
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()

        # Idempotency check
        if not post:
            return "Post not found"
        if post.status == PostStatus.PUBLISHED:
            return "Post already published"

        post.status = PostStatus.PUBLISHING
        db.commit()

        platforms = db.query(PostPlatform).filter(PostPlatform.post_id == post_id).all()
        success_count = 0
        error_messages = []

        for platform in platforms:
            try:
                # Get connected account for this platform
                account = (
                    db.query(SocialAccount)
                    .filter(
                        SocialAccount.user_id == post.created_by,
                        SocialAccount.platform == platform.platform,
                        SocialAccount.status == AccountStatus.CONNECTED,
                    )
                    .first()
                )

                if not account:
                    platform.status = "failed"
                    platform.error_message = "No connected account for this platform"
                    db.commit()
                    error_messages.append(f"{platform.platform}: No connected account")
                    continue

                # Decrypt access token
                access_token = decrypt_token(account.access_token_encrypted)

                # Publish to platform (placeholder for actual API call)
                # In production, this would call the platform adapter
                platform.status = "published"
                platform.external_post_id = f"ext_{post_id}_{platform.platform}"
                success_count += 1
                db.commit()

            except Exception as e:
                platform.status = "failed"
                platform.error_message = str(e)
                db.commit()
                error_messages.append(f"{platform.platform}: {str(e)}")

        # Update post status
        if success_count == len(platforms):
            post.status = PostStatus.PUBLISHED
            post.published_at = datetime.utcnow()
            db.commit()

            # Create success notification
            notification = Notification(
                user_id=post.created_by,
                type=NotificationType.POST_PUBLISHED,
                title="Post Published",
                message=f"Your post has been published to {success_count} platform(s).",
            )
            db.add(notification)
            db.commit()

            return f"Post {post_id} published successfully"
        else:
            post.status = PostStatus.FAILED
            db.commit()

            # Create failure notification
            notification = Notification(
                user_id=post.created_by,
                type=NotificationType.POST_FAILED,
                title="Post Failed",
                message=f"Failed to publish to {len(error_messages)} platform(s): {', '.join(error_messages)}",
            )
            db.add(notification)
            db.commit()

            # Retry if not all platforms failed
            if success_count > 0:
                raise self.retry(exc=Exception(f"Partial failure: {', '.join(error_messages)}"))

            return f"Post {post_id} failed: {', '.join(error_messages)}"

    except Exception as exc:
        post = db.query(Post).filter(Post.id == post_id).first()
        if post:
            post.status = PostStatus.FAILED
            db.commit()
        raise self.retry(exc=exc)
    finally:
        db.close()


@celery_app.task
def refresh_expiring_tokens():
    """Check for tokens expiring soon and refresh them."""
    db = SessionLocal()
    try:
        from datetime import timedelta

        soon = datetime.utcnow() + timedelta(hours=24)
        accounts = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.status == AccountStatus.CONNECTED,
                SocialAccount.expires_at <= soon,
            )
            .all()
        )

        for account in accounts:
            try:
                if account.refresh_token_encrypted:
                    refresh_token = decrypt_token(account.refresh_token_encrypted)
                    # In production, call platform-specific refresh logic
                    # For now, just update the expiration
                    account.expires_at = datetime.utcnow() + timedelta(hours=24)
                    db.commit()
            except Exception:
                account.status = AccountStatus.EXPIRED
                db.commit()

                # Create notification
                notification = Notification(
                    user_id=account.user_id,
                    type=NotificationType.TOKEN_EXPIRED,
                    title="Token Expired",
                    message=f"Your {account.platform.value} connection has expired. Please reconnect.",
                )
                db.add(notification)
                db.commit()

        return f"Checked {len(accounts)} accounts for token refresh"
    finally:
        db.close()
