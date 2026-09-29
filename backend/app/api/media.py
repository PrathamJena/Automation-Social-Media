from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from uuid import uuid4
from app.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.services.storage import upload_file, delete_file

router = APIRouter(prefix="/api/media", tags=["Media"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime"}
ALLOWED_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES


@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Use JPG, PNG, WEBP, MP4, or MOV.",
        )

    file_data = await file.read()
    file_ext = file.filename.split(".")[-1] if file.filename else "bin"
    unique_name = f"{current_user.id}/{uuid4()}.{file_ext}"

    file_url = upload_file(file_data, unique_name, file.content_type)

    return {
        "url": file_url,
        "file_name": file.filename,
        "file_type": file.content_type,
        "file_size": len(file_data),
    }


@router.delete("/{file_name}")
async def delete_media(
    file_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_file(file_name)
    return {"message": "File deleted"}
