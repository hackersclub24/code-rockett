import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    name: str = Field(max_length=200)
    description: str | None = None
    level: str | None = Field(default=None, max_length=50)


class CourseUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    description: str | None = None
    level: str | None = Field(default=None, max_length=50)
    is_active: bool | None = None


class CourseOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    level: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
