import uuid
from datetime import datetime

from pydantic import BaseModel


class CourseEnrollmentRequestOut(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    course_name: str
    student_id: uuid.UUID
    student_name: str
    student_email: str
    status: str
    requested_at: datetime
    reviewed_at: datetime | None


class CourseEnrollmentStatusOut(BaseModel):
    course_id: uuid.UUID
    status: str


class EnrolledCourseOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    level: str | None
    approved_at: datetime | None
