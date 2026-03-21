from fastapi import APIRouter
from app.api import auth, courses, enrollments, admin

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(courses.router, prefix="/courses", tags=["courses"])
# The user specified POST /api/enroll and GET /api/my-courses
# We will include them without prefix in the main router, or with a blank prefix
router.include_router(enrollments.router, prefix="/enrollments", tags=["enrollments"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
