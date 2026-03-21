from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.core.security import get_admin_user_email
from app.schemas.domain import CourseCreate, CourseResponse, ClassSessionCreate, ClassSessionResponse, EnrollmentResponse, UserResponse
from app.services.course import create_course, add_class_session
from app.services.enrollment import get_all_enrollments
from app.services.user import get_all_users

router = APIRouter()

@router.post("/courses", response_model=CourseResponse)
async def create_new_course(
    course_data: CourseCreate,
    admin_email: str = Depends(get_admin_user_email),
    db: AsyncSession = Depends(get_db)
):
    """Admin only: Create a new course."""
    course = await create_course(db, course_data)
    return course

@router.post("/classes", response_model=ClassSessionResponse)
async def create_new_class(
    class_data: ClassSessionCreate,
    admin_email: str = Depends(get_admin_user_email),
    db: AsyncSession = Depends(get_db)
):
    """Admin only: Add a class to a course."""
    session = await add_class_session(db, class_data)
    return session

@router.get("/enrollments", response_model=List[EnrollmentResponse])
async def list_all_enrollments(
    admin_email: str = Depends(get_admin_user_email),
    db: AsyncSession = Depends(get_db)
):
    """Admin only: View all enrollments."""
    enrollments = await get_all_enrollments(db)
    return enrollments

@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    admin_email: str = Depends(get_admin_user_email),
    db: AsyncSession = Depends(get_db)
):
    """Admin only: View all users."""
    users = await get_all_users(db)
    return users
