import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete as sql_delete
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.utils.security import create_access_token, hash_password, hash_token, new_refresh_token, utcnow, verify_password

try:
    from google.auth.transport import requests as grequests
    from google.oauth2 import id_token as google_id_token
except Exception:  # pragma: no cover - optional dependency fallback
    grequests = None
    google_id_token = None


async def register_student(db: AsyncSession, name: str, email: str, password: str, intro: str | None) -> User:
    existing = await db.execute(select(User).where(User.email == email.lower()))
    if existing.scalar_one_or_none():
        raise ValueError("Email already registered")
    user = User(
        name=name,
        email=email.lower(),
        password_hash=hash_password(password),
        role="student",
        status="approved",
        intro=intro,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate(db: AsyncSession, email: str, password: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


async def authenticate_firebase(db: AsyncSession, firebase_token: str) -> User | None:
    s = get_settings()
    if not s.firebase_project_id:
        return None
    if not google_id_token or not grequests:
        return None

    try:
        payload = google_id_token.verify_firebase_token(
            firebase_token,
            grequests.Request(),
            audience=s.firebase_project_id,
        )
    except Exception:
        return None

    if not payload:
        return None

    expected_issuer = f"https://securetoken.google.com/{s.firebase_project_id}"
    if payload.get("iss") != expected_issuer or payload.get("aud") != s.firebase_project_id:
        return None

    email = str(payload.get("email") or "").strip().lower()
    if not email or not payload.get("email_verified"):
        return None

    existing = await db.execute(select(User).where(User.email == email))
    user = existing.scalar_one_or_none()
    if user:
        return user

    name = str(payload.get("name") or email.split("@")[0]).strip() or "Student"
    user = User(
        name=name[:100],
        email=email,
        password_hash=hash_password(new_refresh_token()),
        role="student",
        status="approved",
        intro=None,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def issue_tokens(db: AsyncSession, user: User) -> tuple[str, str]:
    access = create_access_token(str(user.id), user.role, user.status)
    raw_refresh = new_refresh_token()
    s = get_settings()
    expires = utcnow() + timedelta(days=s.refresh_token_expire_days)
    row = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(raw_refresh),
        expires_at=expires,
    )
    db.add(row)
    await db.commit()
    return access, raw_refresh


async def rotate_refresh(db: AsyncSession, raw_refresh: str) -> tuple[User, str, str] | None:
    h = hash_token(raw_refresh)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == h, RefreshToken.expires_at > utcnow())
    )
    row = result.scalar_one_or_none()
    if not row:
        return None
    user_result = await db.execute(select(User).where(User.id == row.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        return None
    await db.execute(sql_delete(RefreshToken).where(RefreshToken.id == row.id))
    await db.flush()
    access, new_raw = await issue_tokens(db, user)
    return user, access, new_raw


async def logout_refresh(db: AsyncSession, raw_refresh: str) -> None:
    h = hash_token(raw_refresh)
    await db.execute(sql_delete(RefreshToken).where(RefreshToken.token_hash == h))
    await db.commit()
