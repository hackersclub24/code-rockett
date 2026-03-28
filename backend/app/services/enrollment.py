from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.models.domain import Enrollment, Course
from sqlalchemy.exc import IntegrityError

async def enroll_user(db: AsyncSession, user_id: int, course_id: int):
    # Verify course exists
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    enrollment = Enrollment(user_id=user_id, course_id=course_id)
    db.add(enrollment)
    try:
        await db.commit()
        result = await db.execute(
            select(Enrollment)
            .options(selectinload(Enrollment.course), selectinload(Enrollment.user))
            .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        )
        return result.scalars().first()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="User is already enrolled in this course")

async def get_user_enrollments(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(Enrollment)
        .options(selectinload(Enrollment.course), selectinload(Enrollment.user))
        .filter(Enrollment.user_id == user_id)
    )
    return result.scalars().all()

async def get_all_enrollments(db: AsyncSession):
    result = await db.execute(
        select(Enrollment).options(selectinload(Enrollment.course), selectinload(Enrollment.user))
    )
    return result.scalars().all()
