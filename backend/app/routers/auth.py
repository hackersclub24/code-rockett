from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.schemas.user import FirebaseLogin, TokenResponse, UserCreate, UserLogin, UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, raw: str) -> None:
    s = get_settings()
    max_age = s.refresh_token_expire_days * 24 * 60 * 60
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=raw,
        httponly=True,
        secure=s.app_env == "production",
        samesite="lax",
        max_age=max_age,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(REFRESH_COOKIE, path="/")


@router.post("/register", response_model=UserOut)
async def register(body: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]) -> User:
    try:
        return await auth_service.register_student(
            db, body.name, body.email, body.password, body.intro
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/login", response_model=TokenResponse)
async def login(
    body: UserLogin,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    user = await auth_service.authenticate(db, body.email, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access, raw_refresh = await auth_service.issue_tokens(db, user)
    _set_refresh_cookie(response, raw_refresh)
    return TokenResponse(access_token=access)


@router.post("/firebase-login", response_model=TokenResponse)
async def firebase_login(
    body: FirebaseLogin,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    user = await auth_service.authenticate_firebase(db, body.id_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")
    access, raw_refresh = await auth_service.issue_tokens(db, user)
    _set_refresh_cookie(response, raw_refresh)
    return TokenResponse(access_token=access)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_view(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    raw = request.cookies.get(REFRESH_COOKIE)
    if not raw:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    rotated = await auth_service.rotate_refresh(db, raw)
    if not rotated:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user, access, new_raw = rotated
    _set_refresh_cookie(response, new_raw)
    return TokenResponse(access_token=access)


@router.post("/logout")
async def logout(request: Request, response: Response, db: Annotated[AsyncSession, Depends(get_db)]) -> dict:
    raw = request.cookies.get(REFRESH_COOKIE)
    if raw:
        await auth_service.logout_refresh(db, raw)
    _clear_refresh_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[User, Depends(get_current_user)]) -> User:
    return user
