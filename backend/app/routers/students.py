from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.auth import require_student
from app.dependencies.db import get_db
from app.models.attendance import Attendance
from app.models.class_ import Class
from app.models.course_enrollment import CourseEnrollment
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.student_assignment import StudentAssignment
from app.models.user import User
from app.schemas.course_enrollment import EnrolledCourseOut
from app.schemas.enrollment import EnrollmentStatusOut
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/me", response_model=UserOut)
async def get_me(user: Annotated[User, Depends(require_student)]) -> User:
    return user


@router.patch("/me", response_model=UserOut)
async def patch_me(
    body: UserUpdate,
    user: Annotated[User, Depends(require_student)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(user, k, v)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/dashboard")
async def student_dashboard(
    user: Annotated[User, Depends(require_student)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    now = datetime.now(UTC)
    approved_ids = select(Enrollment.class_id).where(Enrollment.student_id == user.id, Enrollment.status == "approved")
    upcoming = await db.execute(
        select(Class)
        .options(selectinload(Class.course))
        .where(Class.status == "scheduled", Class.scheduled_at >= now, Class.id.in_(approved_ids))
        .order_by(Class.scheduled_at)
        .limit(5)
    )
    classes = list(upcoming.scalars().all())
    total = await db.execute(select(func.count()).select_from(Attendance).where(Attendance.student_id == user.id))
    present = await db.execute(
        select(func.count())
        .select_from(Attendance)
        .where(Attendance.student_id == user.id, Attendance.status == "present")
    )
    t, p = int(total.scalar_one()), int(present.scalar_one())
    att_pct = round(100.0 * p / t, 1) if t else 0.0
    pending_hw = await db.execute(
        select(StudentAssignment)
        .options(selectinload(StudentAssignment.assignment))
        .where(StudentAssignment.student_id == user.id, StudentAssignment.status == "assigned")
        .order_by(StudentAssignment.updated_at.desc())
        .limit(10)
    )
    hw = list(pending_hw.scalars().unique().all())
    enrolled_courses = await db.execute(
        select(CourseEnrollment, Course)
        .join(Course, Course.id == CourseEnrollment.course_id)
        .where(CourseEnrollment.student_id == user.id, CourseEnrollment.status == "approved")
        .order_by(CourseEnrollment.requested_at.desc())
    )
    return {
        "enrolled_courses": [
            {
                "id": str(course.id),
                "name": course.name,
                "description": course.description,
                "level": course.level,
                "approved_at": enrollment.reviewed_at.isoformat() if enrollment.reviewed_at else None,
            }
            for enrollment, course in enrolled_courses.all()
        ],
        "upcoming_classes": [
            {
                "id": str(c.id),
                "title": c.title,
                "course_name": c.course.name if c.course else None,
                "scheduled_at": c.scheduled_at.isoformat(),
                "meeting_link": c.meeting_link,
            }
            for c in classes
        ],
        "attendance": {"present": p, "total_marked": t, "percent": att_pct},
        "pending_assignments": [
            {
                "link_id": str(x.id),
                "assignment_id": str(x.assignment_id),
                "title": x.assignment.title if x.assignment else None,
                "due_date": x.assignment.due_date.isoformat() if x.assignment and x.assignment.due_date else None,
            }
            for x in hw
        ],
    }


@router.get("/enrolled-courses", response_model=list[EnrolledCourseOut])
async def enrolled_courses(
    user: Annotated[User, Depends(require_student)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[EnrolledCourseOut]:
    result = await db.execute(
        select(CourseEnrollment, Course)
        .join(Course, Course.id == CourseEnrollment.course_id)
        .where(CourseEnrollment.student_id == user.id, CourseEnrollment.status == "approved")
        .order_by(CourseEnrollment.requested_at.desc())
    )
    rows = result.all()
    return [
        EnrolledCourseOut(
            id=course.id,
            name=course.name,
            description=course.description,
            level=course.level,
            approved_at=enrollment.reviewed_at,
        )
        for enrollment, course in rows
    ]


@router.get("/enrollment-requests", response_model=list[EnrollmentStatusOut])
async def my_enrollment_requests(
    user: Annotated[User, Depends(require_student)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[EnrollmentStatusOut]:
    rows = await db.execute(select(Enrollment).where(Enrollment.student_id == user.id))
    return [EnrollmentStatusOut(class_id=x.class_id, status=x.status) for x in rows.scalars().all()]
