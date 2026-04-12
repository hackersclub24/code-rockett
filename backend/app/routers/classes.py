from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.auth import get_current_user, require_admin, require_student
from app.dependencies.db import get_db
from app.models.attendance import Attendance
from app.models.class_ import Class
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.class_ import AttendanceBulk, ClassCreate, ClassOut, ClassUpdate

router = APIRouter(tags=["classes"])


def _class_out(c: Class, instructor_name: str | None = None) -> ClassOut:
    data = ClassOut.model_validate(c)
    return data.model_copy(update={"instructor_name": instructor_name, "course_name": c.course.name if c.course else None})


@router.get("/classes", response_model=list[ClassOut])
async def list_classes_student(
    user: Annotated[User, Depends(require_student)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[ClassOut]:
    approved_ids = select(Enrollment.class_id).where(Enrollment.student_id == user.id, Enrollment.status == "approved")
    q = (
        select(Class)
        .options(selectinload(Class.instructor), selectinload(Class.course))
        .where(
            Class.id.in_(approved_ids),
            Class.status != "cancelled",
        )
        .order_by(Class.scheduled_at)
    )
    result = await db.execute(q)
    rows = result.scalars().unique().all()
    return [_class_out(c, c.instructor.name if c.instructor else None) for c in rows]


@router.get("/classes/{class_id}", response_model=ClassOut)
async def get_class_student(
    class_id: uuid.UUID,
    user: Annotated[User, Depends(require_student)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ClassOut:
    c = await db.get(Class, class_id)
    if not c:
        raise HTTPException(status_code=404, detail="Class not found")
    enr_res = await db.execute(
        select(Enrollment).where(
            Enrollment.class_id == class_id,
            Enrollment.student_id == user.id,
            Enrollment.status == "approved",
        )
    )
    if not enr_res.scalars().first() or c.status == "cancelled":
        raise HTTPException(status_code=404, detail="Class not found")
    res = await db.execute(
        select(Class).options(selectinload(Class.instructor), selectinload(Class.course)).where(Class.id == class_id)
    )
    obj = res.scalar_one()
    return _class_out(obj, obj.instructor.name if obj.instructor else None)


@router.get("/public/classes", response_model=list[ClassOut])
async def list_classes_public(db: Annotated[AsyncSession, Depends(get_db)]) -> list[ClassOut]:
    now = datetime.now(UTC)
    result = await db.execute(
        select(Class)
        .options(selectinload(Class.instructor), selectinload(Class.course))
        .where(Class.status == "scheduled", Class.scheduled_at >= now)
        .order_by(Class.scheduled_at)
    )
    rows = result.scalars().unique().all()
    return [_class_out(c, c.instructor.name if c.instructor else None) for c in rows]


@router.post("/classes/{class_id}/enroll-request")
async def request_enrollment(
    class_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Students only")
    c = await db.get(Class, class_id)
    if not c or c.status != "scheduled":
        raise HTTPException(status_code=404, detail="Class not found")
    existing = await db.execute(select(Enrollment).where(Enrollment.class_id == class_id, Enrollment.student_id == user.id))
    row = existing.scalars().first()
    if row:
        if row.status == "rejected":
            row.status = "pending"
            row.reviewed_at = None
            row.reviewed_by = None
            await db.commit()
        return {"id": str(row.id), "status": row.status}
    enr = Enrollment(class_id=class_id, student_id=user.id, status="pending")
    db.add(enr)
    await db.commit()
    await db.refresh(enr)
    return {"id": str(enr.id), "status": enr.status}


@router.get("/admin/classes", response_model=list[ClassOut])
async def list_classes_admin(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[ClassOut]:
    result = await db.execute(
        select(Class).options(selectinload(Class.instructor), selectinload(Class.course)).order_by(Class.scheduled_at.desc())
    )
    rows = result.scalars().unique().all()
    return [_class_out(c, c.instructor.name if c.instructor else None) for c in rows]


@router.post("/admin/classes", response_model=ClassOut)
async def create_class(
    body: ClassCreate,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ClassOut:
    c = Class(
        title=body.title,
        description=body.description,
        scheduled_at=body.scheduled_at,
        duration_mins=body.duration_mins,
        meeting_link=body.meeting_link,
        course_id=body.course_id,
        instructor_id=body.instructor_id,
        max_capacity=body.max_capacity,
        status="scheduled",
    )
    db.add(c)
    await db.commit()
    await db.refresh(c)
    c = (
        await db.execute(select(Class).options(selectinload(Class.instructor), selectinload(Class.course)).where(Class.id == c.id))
    ).scalar_one()
    return _class_out(c, c.instructor.name if c.instructor else None)


@router.get("/admin/classes/{class_id}", response_model=ClassOut)
async def get_class_admin(
    class_id: uuid.UUID,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ClassOut:
    result = await db.execute(
        select(Class).options(selectinload(Class.instructor), selectinload(Class.course)).where(Class.id == class_id)
    )
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Class not found")
    return _class_out(c, c.instructor.name if c.instructor else None)


@router.patch("/admin/classes/{class_id}", response_model=ClassOut)
async def update_class(
    class_id: uuid.UUID,
    body: ClassUpdate,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ClassOut:
    c = await db.get(Class, class_id)
    if not c:
        raise HTTPException(status_code=404, detail="Class not found")
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(c, k, v)
    await db.commit()
    await db.refresh(c)
    c = (
        await db.execute(select(Class).options(selectinload(Class.instructor), selectinload(Class.course)).where(Class.id == c.id))
    ).scalar_one()
    return _class_out(c, c.instructor.name if c.instructor else None)


@router.delete("/admin/classes/{class_id}")
async def cancel_class(
    class_id: uuid.UUID,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    c = await db.get(Class, class_id)
    if not c:
        raise HTTPException(status_code=404, detail="Class not found")
    c.status = "cancelled"
    await db.commit()
    return {"ok": True}


@router.post("/admin/classes/{class_id}/attendance")
async def mark_attendance(
    class_id: uuid.UUID,
    body: AttendanceBulk,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    c = await db.get(Class, class_id)
    if not c:
        raise HTTPException(status_code=404, detail="Class not found")
    for mark in body.marks:
        existing = await db.execute(
            select(Attendance).where(Attendance.class_id == class_id, Attendance.student_id == mark.student_id)
        )
        row = existing.scalars().first()
        if row:
            row.status = mark.status
            row.marked_by = admin.id
            row.marked_at = datetime.now(UTC)
        else:
            db.add(
                Attendance(
                    class_id=class_id,
                    student_id=mark.student_id,
                    status=mark.status,
                    marked_by=admin.id,
                    marked_at=datetime.now(UTC),
                )
            )
    await db.commit()
    return {"ok": True, "count": len(body.marks)}
