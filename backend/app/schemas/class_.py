import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ClassCreate(BaseModel):
    title: str = Field(max_length=200)
    description: str | None = None
    scheduled_at: datetime
    duration_mins: int = 60
    meeting_link: str
    course_id: uuid.UUID | None = None
    instructor_id: uuid.UUID | None = None
    max_capacity: int | None = None


class ClassUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    description: str | None = None
    scheduled_at: datetime | None = None
    duration_mins: int | None = None
    meeting_link: str | None = None
    course_id: uuid.UUID | None = None
    instructor_id: uuid.UUID | None = None
    max_capacity: int | None = None
    status: str | None = None


class ClassOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    scheduled_at: datetime
    duration_mins: int
    meeting_link: str
    course_id: uuid.UUID | None
    course_name: str | None = None
    instructor_id: uuid.UUID | None
    instructor_name: str | None = None
    max_capacity: int | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AttendanceMark(BaseModel):
    student_id: uuid.UUID
    status: str


class AttendanceBulk(BaseModel):
    marks: list[AttendanceMark]
