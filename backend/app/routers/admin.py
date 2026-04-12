from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.auth import require_admin
from app.dependencies.db import get_db
from app.models.attendance import Attendance
from app.models.class_ import Class
from app.models.enrollment import Enrollment
from app.models.course_enrollment import CourseEnrollment
from app.models.student_assignment import StudentAssignment
from app.models.user import User
from app.schemas.enrollment import EnrollmentRequestOut
from app.schemas.user import UserOut
from app.services import email_service

router = APIRouter(prefix="/admin", tags=["admin"])


def _enrollment_out(enr: Enrollment, stu: User, cls: Class) -> EnrollmentRequestOut:
    return EnrollmentRequestOut(
        id=enr.id,
        class_id=cls.id,
        class_title=cls.title,
        student_id=stu.id,
        student_name=stu.name,
        student_email=stu.email,
        status=enr.status,
        enrolled_at=enr.enrolled_at,
        reviewed_at=enr.reviewed_at,
    )


async def _load_enrollment_details(db: AsyncSession, request_id: uuid.UUID) -> tuple[Enrollment, User, Class]:
    details = await db.execute(
        select(Enrollment, User, Class)
        .join(User, User.id == Enrollment.student_id)
        .join(Class, Class.id == Enrollment.class_id)
        .where(Enrollment.id == request_id)
    )
    return details.one()


async def _set_enrollment_status(
    db: AsyncSession,
    request_id: uuid.UUID,
    admin_id: uuid.UUID,
    status: str,
) -> EnrollmentRequestOut:
    row = await db.get(Enrollment, request_id)
    if not row:
        raise HTTPException(status_code=404, detail="Enrollment request not found")
    row.status = status
    row.reviewed_by = admin_id
    row.reviewed_at = datetime.now(UTC)
    await db.commit()
    enr, stu, cls = await _load_enrollment_details(db, request_id)
    return _enrollment_out(enr, stu, cls)


@router.get("/overview")
async def admin_overview(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    registered = await db.execute(select(func.count()).select_from(User).where(User.role == "student"))
    students = await db.execute(
        select(func.count()).select_from(User).where(User.role == "student", User.status == "approved")
    )
    now = datetime.now(UTC)
    upcoming = await db.execute(
        select(func.count())
        .select_from(Class)
        .where(Class.status == "scheduled", Class.scheduled_at >= now)
    )
    pending_enrollments = await db.execute(
        select(func.count()).select_from(Enrollment).where(Enrollment.status == "pending")
    )
    pending_course_enrollments = await db.execute(
        select(func.count()).select_from(CourseEnrollment).where(CourseEnrollment.status == "pending")
    )
    return {
        "registered_students": int(registered.scalar_one()),
        "approved_students": int(students.scalar_one()),
        "upcoming_classes": int(upcoming.scalar_one()),
        "pending_enrollments": int(pending_enrollments.scalar_one()),
        "pending_course_enrollments": int(pending_course_enrollments.scalar_one()),
    }


@router.get("/enrollment-requests", response_model=list[EnrollmentRequestOut])
async def list_enrollment_requests(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: str = Query("pending", alias="status"),
) -> list[EnrollmentRequestOut]:
    q = (
        select(Enrollment, User, Class)
        .join(User, User.id == Enrollment.student_id)
        .join(Class, Class.id == Enrollment.class_id)
        .where(Enrollment.status == status_filter)
        .order_by(Enrollment.enrolled_at.asc())
    )
    rows = (await db.execute(q)).all()
    return [_enrollment_out(enr, stu, cls) for enr, stu, cls in rows]


@router.patch("/enrollment-requests/{request_id}/approve", response_model=EnrollmentRequestOut)
async def approve_enrollment_request(
    request_id: uuid.UUID,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EnrollmentRequestOut:
    return await _set_enrollment_status(db, request_id, admin.id, "approved")


@router.patch("/enrollment-requests/{request_id}/reject", response_model=EnrollmentRequestOut)
async def reject_enrollment_request(
    request_id: uuid.UUID,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> EnrollmentRequestOut:
    return await _set_enrollment_status(db, request_id, admin.id, "rejected")


@router.get("/students", response_model=list[UserOut])
async def list_students(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
) -> list[User]:
    q = select(User).where(User.role == "student")
    if status_filter:
        q = q.where(User.status == status_filter)
    q = q.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.patch("/students/{student_id}/approve", response_model=UserOut)
async def approve_student(
    student_id: uuid.UUID,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    user = await db.get(User, student_id)
    if not user or user.role != "student":
        raise HTTPException(status_code=404, detail="Student not found")
    user.status = "approved"
    await db.commit()
    await db.refresh(user)
    email_service.notify_student_decision(user.email, user.name, True)
    return user


@router.patch("/students/{student_id}/reject", response_model=UserOut)
async def reject_student(
    student_id: uuid.UUID,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    user = await db.get(User, student_id)
    if not user or user.role != "student":
        raise HTTPException(status_code=404, detail="Student not found")
    user.status = "rejected"
    await db.commit()
    await db.refresh(user)
    email_service.notify_student_decision(user.email, user.name, False)
    return user


async def _attendance_rate(db: AsyncSession, student_id: uuid.UUID) -> float:
    total = await db.execute(select(func.count()).select_from(Attendance).where(Attendance.student_id == student_id))
    present = await db.execute(
        select(func.count())
        .select_from(Attendance)
        .where(Attendance.student_id == student_id, Attendance.status == "present")
    )
    t, p = int(total.scalar_one()), int(present.scalar_one())
    if t == 0:
        return 0.0
    return round(100.0 * p / t, 1)


async def _assignment_completion(db: AsyncSession, student_id: uuid.UUID) -> float:
    total = await db.execute(
        select(func.count()).select_from(StudentAssignment).where(StudentAssignment.student_id == student_id)
    )
    reviewed = await db.execute(
        select(func.count())
        .select_from(StudentAssignment)
        .where(StudentAssignment.student_id == student_id, StudentAssignment.status == "reviewed")
    )
    t, r = int(total.scalar_one()), int(reviewed.scalar_one())
    if t == 0:
        return 0.0
    return round(100.0 * r / t, 1)


@router.get("/students/{student_id}")
async def student_detail(
    student_id: uuid.UUID,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    user = await db.get(User, student_id)
    if not user or user.role != "student":
        raise HTTPException(status_code=404, detail="Student not found")
    att_rows = await db.execute(
        select(Attendance)
        .options(selectinload(Attendance.class_))
        .where(Attendance.student_id == student_id)
        .order_by(Attendance.marked_at.desc())
    )
    sa_rows = await db.execute(
        select(StudentAssignment)
        .options(selectinload(StudentAssignment.assignment))
        .where(StudentAssignment.student_id == student_id)
        .order_by(StudentAssignment.updated_at.desc())
    )
    return {
        "user": UserOut.model_validate(user),
        "attendance_rate": await _attendance_rate(db, student_id),
        "assignment_completion": await _assignment_completion(db, student_id),
        "attendance": [
            {
                "class_id": str(a.class_id),
                "class_title": a.class_.title if a.class_ else None,
                "status": a.status,
                "marked_at": a.marked_at.isoformat(),
            }
            for a in att_rows.scalars().all()
        ],
        "assignments": [
            {
                "id": str(sa.id),
                "assignment_id": str(sa.assignment_id),
                "title": sa.assignment.title if sa.assignment else None,
                "status": sa.status,
                "notes": sa.notes,
                "due_date": sa.assignment.due_date.isoformat() if sa.assignment and sa.assignment.due_date else None,
            }
            for sa in sa_rows.scalars().all()
        ],
    }
