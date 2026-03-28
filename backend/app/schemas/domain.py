from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class CourseBase(BaseModel):
    title: str
    description: str

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ClassSessionBase(BaseModel):
    title: str
    datetime: datetime
    meet_link: str

class ClassSessionCreate(ClassSessionBase):
    course_id: int

class ClassSessionResponse(ClassSessionBase):
    id: int
    course_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CourseDetailResponse(CourseResponse):
    classes: List[ClassSessionResponse] = []

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    created_at: datetime
    course: CourseResponse
    user: Optional[UserResponse] = None
    model_config = ConfigDict(from_attributes=True)
