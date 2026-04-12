from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies.auth import require_admin, require_student
from app.dependencies.db import get_db
from app.models.assignment import Assignment
from app.models.student_assignment import StudentAssignment
from app.models.user import User
from app.schemas.assignment import AssignmentCreate, AssignmentOut, AssignmentUpdate, StudentAssignmentOut, StudentAssignmentUpdate

router = APIRouter(tags=["assignments"])


@router.get("/assignments", response_model=list[StudentAssignmentOut])
async def my_assignments(
    user: Annotated[User, Depends(require_student)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[StudentAssignment]:
    result = await db.execute(
        select(StudentAssignment)
        .options(selectinload(StudentAssignment.assignment))
        .where(StudentAssignment.student_id == user.id)
        .order_by(StudentAssignment.updated_at.desc())
    )
    return list(result.scalars().unique().all())


@router.get("/admin/student-assignments")
async def admin_list_student_assignments(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[dict]:
    result = await db.execute(
        select(StudentAssignment)
        .options(selectinload(StudentAssignment.assignment), selectinload(StudentAssignment.student))
        .order_by(StudentAssignment.updated_at.desc())
    )
    rows = result.scalars().unique().all()
    return [
        {
            "id": str(r.id),
            "assignment_id": str(r.assignment_id),
            "assignment_title": r.assignment.title if r.assignment else None,
            "student_id": str(r.student_id),
            "student_name": r.student.name if r.student else None,
            "status": r.status,
            "notes": r.notes,
            "updated_at": r.updated_at.isoformat(),
        }
        for r in rows
    ]


@router.get("/admin/assignments", response_model=list[AssignmentOut])
async def admin_list_assignments(
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[Assignment]:
    result = await db.execute(select(Assignment).order_by(Assignment.created_at.desc()))
    return list(result.scalars().all())


@router.post("/admin/assignments", response_model=AssignmentOut)
async def admin_create_assignment(
    body: AssignmentCreate,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Assignment:
    a = Assignment(
        title=body.title,
        description=body.description,
        class_id=body.class_id,
        due_date=body.due_date,
        created_by=admin.id,
    )
    db.add(a)
    await db.flush()
    if body.assign_all:
        studs = await db.execute(select(User).where(User.role == "student", User.status == "approved"))
        targets = [u.id for u in studs.scalars().all()]
    else:
        targets = body.student_ids
    for sid in targets:
        db.add(StudentAssignment(assignment_id=a.id, student_id=sid, status="assigned"))
    await db.commit()
    await db.refresh(a)
    return a


@router.patch("/admin/assignments/{assignment_id}", response_model=AssignmentOut)
async def admin_update_assignment(
    assignment_id: uuid.UUID,
    body: AssignmentUpdate,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Assignment:
    a = await db.get(Assignment, assignment_id)
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(a, k, v)
    await db.commit()
    await db.refresh(a)
    return a


@router.patch("/admin/student-assignments/{link_id}", response_model=StudentAssignmentOut)
async def admin_update_student_assignment(
    link_id: uuid.UUID,
    body: StudentAssignmentUpdate,
    _: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> StudentAssignment:
    row = await db.get(StudentAssignment, link_id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    row.status = body.status
    row.notes = body.notes
    await db.commit()
    row = (
        await db.execute(
            select(StudentAssignment)
            .options(selectinload(StudentAssignment.assignment))
            .where(StudentAssignment.id == link_id)
        )
    ).scalar_one()
    return row
