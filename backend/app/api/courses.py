from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.database import get_db
from app.services.course import get_all_courses, get_course_with_classes
from app.schemas.domain import CourseResponse, CourseDetailResponse

router = APIRouter()

@router.get("/", response_model=List[CourseResponse])
async def list_courses(db: AsyncSession = Depends(get_db)):
    """Get all public courses."""
    courses = await get_all_courses(db)
    return courses

@router.get("/{course_id}", response_model=CourseDetailResponse)
async def get_course(course_id: int, db: AsyncSession = Depends(get_db)):
    """Get a course definition along with its classes."""
    course = await get_course_with_classes(db, course_id)
    return course
