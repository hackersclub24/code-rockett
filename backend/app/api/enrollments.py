from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.core.security import get_current_user_email
from app.services.user import get_or_create_user
from app.services.enrollment import enroll_user, get_user_enrollments
from pydantic import BaseModel
from app.schemas.domain import EnrollmentResponse

router = APIRouter()

# Schema for the request body
class EnrollRequest(BaseModel):
    course_id: int

@router.post("/enroll", response_model=EnrollmentResponse)
async def enroll(
    request: EnrollRequest,
    email: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """Enroll the current user in a course."""
    user = await get_or_create_user(db, email)
    enrollment = await enroll_user(db, user_id=user.id, course_id=request.course_id)
    return enrollment

@router.get("/my-courses", response_model=List[EnrollmentResponse])
async def my_courses(
    email: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db)
):
    """Get all courses the current user is enrolled in."""
    user = await get_or_create_user(db, email)
    enrollments = await get_user_enrollments(db, user.id)
    return enrollments
