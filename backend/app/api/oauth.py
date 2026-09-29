from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from uuid import uuid4
import secrets
import json
import redis

from app.database import get_db
from app.models.user import User
from app.models.social_account import SocialAccount, Platform, AccountStatus
from app.api.deps import get_current_user
from app.core.config import get_settings
from app.utils.encryption import encrypt_token, decrypt_token
from app.integrations.meta.oauth import MetaOAuth
from app.integrations.linkedin.linkedin import LinkedInAdapter
from app.integrations.whatsapp.whatsapp import WhatsAppAdapter

settings = get_settings()

# Redis client for OAuth state storage
redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

router = APIRouter(prefix="/api/social-accounts", tags=["OAuth"])


def get_meta_oauth(platform: str) -> MetaOAuth:
    if platform == "facebook":
        return MetaOAuth(
            client_id=settings.FACEBOOK_CLIENT_ID,
            client_secret=settings.FACEBOOK_CLIENT_SECRET,
            redirect_uri=settings.FACEBOOK_REDIRECT_URI,
        )
    elif platform == "instagram":
        return MetaOAuth(
            client_id=settings.INSTAGRAM_CLIENT_ID,
            client_secret=settings.INSTAGRAM_CLIENT_SECRET,
            redirect_uri=settings.INSTAGRAM_REDIRECT_URI,
        )
    raise ValueError(f"Unsupported Meta platform: {platform}")


def get_linkedin_oauth() -> LinkedInAdapter:
    return LinkedInAdapter()


def get_whatsapp_oauth() -> WhatsAppAdapter:
    return WhatsAppAdapter()


@router.get("/{platform}/connect")
async def initiate_oauth(
    platform: str,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """Initiate OAuth flow for a social platform."""
    state = secrets.token_urlsafe(32)

    # Store state in Redis with user ID (expires in 10 minutes)
    state_data = json.dumps({"user_id": str(current_user.id), "platform": platform})
    redis_client.setex(f"oauth_state:{state}", 600, state_data)

    if platform in ["facebook", "instagram"]:
        oauth = get_meta_oauth(platform)
        scope = "pages_manage_posts,pages_read_engagement" if platform == "facebook" else "user_profile,user_media"
        auth_url = oauth.get_authorization_url(state=state, scope=scope)
    elif platform == "linkedin":
        oauth = get_linkedin_oauth()
        auth_url = oauth.get_authorization_url(state=state)
    elif platform == "whatsapp":
        oauth = get_whatsapp_oauth()
        auth_url = oauth.get_authorization_url(state=state)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")

    return {"auth_url": auth_url, "state": state}


@router.get("/{platform}/callback")
async def oauth_callback(
    platform: str,
    code: str,
    state: str,
    error: str = None,
    db: Session = Depends(get_db),
):
    """Handle OAuth callback from social platforms."""
    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")

    # Validate state
    state_data = redis_client.get(f"oauth_state:{state}")
    if not state_data:
        raise HTTPException(status_code=400, detail="Invalid or expired state")

    redis_client.delete(f"oauth_state:{state}")
    state_info = json.loads(state_data)
    user_id = state_info["user_id"]

    # Exchange code for tokens
    try:
        if platform in ["facebook", "instagram"]:
            oauth = get_meta_oauth(platform)
            token_data = await oauth.exchange_code(code)
        elif platform == "linkedin":
            oauth = get_linkedin_oauth()
            redirect_uri = settings.LINKEDIN_REDIRECT_URI
            token_data = await oauth.connect(code, redirect_uri)
        elif platform == "whatsapp":
            oauth = get_whatsapp_oauth()
            token_data = await oauth.connect(code, "")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {str(e)}")

    # Encrypt and store tokens
    access_token = token_data.get("access_token", "")
    refresh_token = token_data.get("refresh_token", "")
    expires_in = token_data.get("expires_in", 3600)

    encrypted_access = encrypt_token(access_token) if access_token else None
    encrypted_refresh = encrypt_token(refresh_token) if refresh_token else None

    # Check if account already exists
    existing = db.query(SocialAccount).filter(
        SocialAccount.user_id == user_id,
        SocialAccount.platform == platform,
    ).first()

    if existing:
        existing.access_token_encrypted = encrypted_access
        existing.refresh_token_encrypted = encrypted_refresh
        existing.status = AccountStatus.CONNECTED
        existing.account_id = token_data.get("user_id", "")
        existing.account_name = token_data.get("name", "")
    else:
        account = SocialAccount(
            user_id=user_id,
            platform=Platform(platform),
            account_id=token_data.get("user_id", ""),
            account_name=token_data.get("name", ""),
            access_token_encrypted=encrypted_access,
            refresh_token_encrypted=encrypted_refresh,
            status=AccountStatus.CONNECTED,
        )
        db.add(account)

    db.commit()

    # Redirect to frontend success page
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/social-accounts?connected={platform}")


@router.post("/{account_id}/disconnect")
async def disconnect_account(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Disconnect a social account."""
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == current_user.id,
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    account.status = AccountStatus.DISCONNECTED
    account.access_token_encrypted = None
    account.refresh_token_encrypted = None
    db.commit()

    return {"message": "Account disconnected"}


@router.get("/{account_id}/status")
async def get_account_status(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the status of a connected account."""
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == current_user.id,
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    return {
        "id": str(account.id),
        "platform": account.platform.value,
        "status": account.status.value,
        "account_name": account.account_name,
    }
