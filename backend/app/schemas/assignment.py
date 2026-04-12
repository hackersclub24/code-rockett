import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class AssignmentCreate(BaseModel):
    title: str = Field(max_length=200)
    description: str | None = None
    class_id: uuid.UUID | None = None
    due_date: datetime | None = None
    assign_all: bool = True
    student_ids: list[uuid.UUID] = Field(default_factory=list)


class AssignmentUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    description: str | None = None
    class_id: uuid.UUID | None = None
    due_date: datetime | None = None


class StudentAssignmentUpdate(BaseModel):
    status: str
    notes: str | None = None


class AssignmentOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    class_id: uuid.UUID | None
    due_date: datetime | None
    created_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class StudentAssignmentOut(BaseModel):
    id: uuid.UUID
    assignment_id: uuid.UUID
    student_id: uuid.UUID
    status: str
    notes: str | None
    updated_at: datetime
    assignment: AssignmentOut | None = None

    model_config = {"from_attributes": True}
