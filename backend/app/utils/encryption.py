from cryptography.fernet import Fernet
from app.core.config import get_settings

settings = get_settings()

def get_fernet():
    key = settings.SECRET_KEY[:32].encode().ljust(32, b"0")
    return Fernet(key)


def encrypt_token(token: str) -> str:
    f = get_fernet()
    return f.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    f = get_fernet()
    return f.decrypt(encrypted_token.encode()).decode()
