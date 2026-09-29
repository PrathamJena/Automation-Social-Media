"""Create the database tables and an initial admin user.

Run once on a fresh install:

    python -m app.scripts.seed_admin

Credentials come from the environment so nothing is hardcoded:

    ADMIN_EMAIL      default admin@company.com
    ADMIN_PASSWORD   default admin123   (change this for anything real)
    ADMIN_NAME       default Admin

Usage
-----
    docker compose exec backend python -m app.scripts.seed_admin
    ADMIN_PASSWORD='a-strong-password' docker compose exec -e ADMIN_PASSWORD=... backend ...
"""

import os
import sys

from app.core.security import get_password_hash
from app.database import Base, SessionLocal, engine
from app.models import User  # noqa: F401  (registers the tables)
from app.models.user import UserRole

WEAK_PASSWORDS = {
    "admin123",
    "password",
    "12345678",
    "changeme",
    "secret",
}


def main() -> int:
    email = os.getenv("ADMIN_EMAIL", "admin@company.com").strip().lower()
    password = os.getenv("ADMIN_PASSWORD", "admin123")
    name = os.getenv("ADMIN_NAME", "Admin")
    role = os.getenv("ADMIN_ROLE", "ADMIN").upper()

    if not email or "@" not in email:
        print("ADMIN_EMAIL is not a valid email address.", file=sys.stderr)
        return 1

    print("Creating tables (if they do not exist)...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User {email} already exists - nothing to do.")
            return 0

        if role not in {r.value for r in UserRole}:
            print(f"Unknown role {role!r}. Use ADMIN, EDITOR or VIEWER.", file=sys.stderr)
            return 1

        user = User(
            name=name,
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole(role),
            is_active="Y",
        )
        db.add(user)
        db.commit()

        print("\nAdmin user created.")
        print(f"  email:    {email}")
        if password in WEAK_PASSWORDS:
            print("  password: (default) admin123")
            print("\n  WARNING: this is a well-known default password.")
            print("  Set ADMIN_PASSWORD to something strong before exposing the app.")
        else:
            print("  password: (the value you supplied)")

        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
