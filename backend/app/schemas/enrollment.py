import uuid
from datetime import datetime

from pydantic import BaseModel


class EnrollmentRequestOut(BaseModel):
    id: uuid.UUID
    class_id: uuid.UUID
    class_title: str
    student_id: uuid.UUID
    student_name: str
    student_email: str
    status: str
    enrolled_at: datetime
    reviewed_at: datetime | None


class EnrollmentStatusOut(BaseModel):
    class_id: uuid.UUID
    status: str
