import boto3
from botocore.config import Config
from app.core.config import get_settings

settings = get_settings()


def get_s3_client():
    session = boto3.session.Session()
    return session.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name=settings.S3_REGION,
        config=Config(signature_version="s3v4"),
        verify=settings.S3_USE_SSL,
    )


def upload_file(file_data: bytes, file_name: str, content_type: str) -> str:
    s3 = get_s3_client()
    s3.put_object(
        Bucket=settings.S3_BUCKET,
        Key=file_name,
        Body=file_data,
        ContentType=content_type,
    )
    url = f"{settings.S3_ENDPOINT}/{settings.S3_BUCKET}/{file_name}"
    return url


def delete_file(file_name: str) -> bool:
    s3 = get_s3_client()
    s3.delete_object(Bucket=settings.S3_BUCKET, Key=file_name)
    return True


def get_presigned_url(file_name: str, expiration: int = 3600) -> str:
    s3 = get_s3_client()
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": file_name},
        ExpiresIn=expiration,
    )
    return url
