from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.models.domain import Course, ClassSession
from app.schemas.domain import CourseCreate, ClassSessionCreate

async def get_all_courses(db: AsyncSession):
    result = await db.execute(select(Course).order_by(Course.created_at.desc()))
    return result.scalars().all()

async def get_course_with_classes(db: AsyncSession, course_id: int):
    result = await db.execute(
        select(Course).options(selectinload(Course.classes)).filter(Course.id == course_id)
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

async def create_course(db: AsyncSession, course_data: CourseCreate):
    course = Course(**course_data.model_dump())
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course

async def add_class_session(db: AsyncSession, class_data: ClassSessionCreate):
    # Verify course exists
    course = await db.get(Course, class_data.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    session = ClassSession(**class_data.model_dump())
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session
