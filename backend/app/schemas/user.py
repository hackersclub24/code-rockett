import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    intro: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    status: str
    intro: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    intro: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class StudentApprove(BaseModel):
    pass
