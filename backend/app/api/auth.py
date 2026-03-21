from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.security import get_current_user_email
from app.services.user import get_or_create_user
from app.schemas.domain import UserResponse

router = APIRouter()

@router.post("/login", response_model=UserResponse)
async def login(
    email: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """
    This endpoint requires a valid Firebase ID token in the Authorization header.
    It verifies the token, extracts the email, and returns or creates the user in our DB.
    """
    user = await get_or_create_user(db, email=email)
    return user
