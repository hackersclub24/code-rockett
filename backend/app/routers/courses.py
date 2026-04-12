from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user, require_admin
from app.dependencies.db import get_db
from app.models.course import Course
from app.models.course_enrollment import CourseEnrollment
from app.models.user import User
from app.schemas.course import CourseCreate, CourseOut, CourseUpdate
from app.schemas.course_enrollment import CourseEnrollmentRequestOut, CourseEnrollmentStatusOut

router = APIRouter(tags=["courses"])


def _course_enrollment_out(row: CourseEnrollment, course: Course, student: User) -> CourseEnrollmentRequestOut:
    return CourseEnrollmentRequestOut(
        id=row.id,
        course_id=course.id,
        course_name=course.name,
        student_id=student.id,
        student_name=student.name,
        student_email=student.email,
        status=row.status,
        requested_at=row.requested_at,
        reviewed_at=row.reviewed_at,
    )


@router.get("/courses/catalog", response_model=list[CourseOut])
async def list_active_courses(db: Annotated[AsyncSession, Depends(get_db)]) -> list[CourseOut]:
    result = await db.execute(select(Course).where(Course.is_active.is_(True)).order_by(Course.name.asc()))
    return list(result.scalars().all())


@router.get("/student/course-requests", response_model=list[CourseEnrollmentStatusOut])
async def my_course_requests(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[CourseEnrollmentStatusOut]:
    if user.role != "student" or user.status != "approved":
        raise HTTPException(status_code=403, detail="Students only")
    result = await db.execute(select(CourseEnrollment).where(CourseEnrollment.student_id == user.id))
    return [CourseEnrollmentStatusOut(course_id=row.course_id, status=row.status) for row in result.scalars().all()]


@router.post("/courses/{course_id}/enroll-request", response_model=CourseEnrollmentStatusOut)
async def request_course_enrollment(
    course_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CourseEnrollmentStatusOut:
    if user.role != "student" or user.status != "approved":
        raise HTTPException(status_code=403, detail="Students only")
    course = await db.get(Course, course_id)
    if not course or not course.is_active:
        raise HTTPException(status_code=404, detail="Course not found")
    existing = await db.execute(
        select(CourseEnrollment).where(CourseEnrollment.course_id == course_id, CourseEnrollment.student_id == user.id)
    )
    row = existing.scalars().first()
    if row:
        if row.status == "rejected":
            row.status = "pending"
            row.reviewed_at = None
            row.reviewed_by = None
            await db.commit()
        return CourseEnrollmentStatusOut(course_id=course_id, status=row.status)
    row = CourseEnrollment(course_id=course_id, student_id=user.id, status="pending")
    db.add(row)
    await db.commit()
    return CourseEnrollmentStatusOut(course_id=course_id, status="pending")


@router.get("/admin/courses", response_model=list[CourseOut])
async def list_courses_admin(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[CourseOut]:
    result = await db.execute(select(Course).order_by(Course.created_at.desc()))
    return list(result.scalars().all())


@router.get("/admin/course-enrollment-requests", response_model=list[CourseEnrollmentRequestOut])
async def list_course_enrollment_requests(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: str = "pending",
) -> list[CourseEnrollmentRequestOut]:
    result = await db.execute(
        select(CourseEnrollment, Course, User)
        .join(Course, Course.id == CourseEnrollment.course_id)
        .join(User, User.id == CourseEnrollment.student_id)
        .where(CourseEnrollment.status == status_filter)
        .order_by(CourseEnrollment.requested_at.asc())
    )
    return [_course_enrollment_out(row, course, student) for row, course, student in result.all()]


@router.patch("/admin/course-enrollment-requests/{request_id}/approve", response_model=CourseEnrollmentRequestOut)
async def approve_course_enrollment_request(
    request_id: uuid.UUID,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CourseEnrollmentRequestOut:
    row = await db.get(CourseEnrollment, request_id)
    if not row:
        raise HTTPException(status_code=404, detail="Course request not found")
    row.status = "approved"
    row.reviewed_by = admin.id
    row.reviewed_at = datetime.now(UTC)
    await db.commit()
    result = await db.execute(
        select(CourseEnrollment, Course, User)
        .join(Course, Course.id == CourseEnrollment.course_id)
        .join(User, User.id == CourseEnrollment.student_id)
        .where(CourseEnrollment.id == request_id)
    )
    row, course, student = result.one()
    return _course_enrollment_out(row, course, student)


@router.patch("/admin/course-enrollment-requests/{request_id}/reject", response_model=CourseEnrollmentRequestOut)
async def reject_course_enrollment_request(
    request_id: uuid.UUID,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CourseEnrollmentRequestOut:
    row = await db.get(CourseEnrollment, request_id)
    if not row:
        raise HTTPException(status_code=404, detail="Course request not found")
    row.status = "rejected"
    row.reviewed_by = admin.id
    row.reviewed_at = datetime.now(UTC)
    await db.commit()
    result = await db.execute(
        select(CourseEnrollment, Course, User)
        .join(Course, Course.id == CourseEnrollment.course_id)
        .join(User, User.id == CourseEnrollment.student_id)
        .where(CourseEnrollment.id == request_id)
    )
    row, course, student = result.one()
    return _course_enrollment_out(row, course, student)


@router.post("/admin/courses", response_model=CourseOut)
async def create_course(
    body: CourseCreate,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CourseOut:
    existing = await db.execute(select(Course).where(Course.name == body.name.strip()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Course already exists")
    row = Course(name=body.name.strip(), description=body.description, level=body.level)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return CourseOut.model_validate(row)


@router.patch("/admin/courses/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: uuid.UUID,
    body: CourseUpdate,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CourseOut:
    row = await db.get(Course, course_id)
    if not row:
        raise HTTPException(status_code=404, detail="Course not found")
    data = body.model_dump(exclude_unset=True)
    if "name" in data and data["name"] is not None:
        data["name"] = data["name"].strip()
    for k, v in data.items():
        setattr(row, k, v)
    await db.commit()
    await db.refresh(row)
    return CourseOut.model_validate(row)
