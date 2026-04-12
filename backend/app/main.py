import asyncio
from pathlib import Path
from contextlib import asynccontextmanager

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.models.user import User
from app.routers import admin, assignments, auth, classes, courses, students
from app.utils.security import hash_password


@asynccontextmanager
async def lifespan(_: FastAPI):
    await run_migrations()
    await seed_admin()
    yield


async def run_migrations() -> None:
    alembic_ini = Path(__file__).resolve().parents[1] / "alembic.ini"

    def upgrade() -> None:
        command.upgrade(Config(str(alembic_ini)), "head")

    await asyncio.to_thread(upgrade)


async def seed_admin() -> None:
    s = get_settings()
    if not (s.admin_email_seed and s.admin_password_seed):
        return
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email == s.admin_email_seed.lower()))
        if existing.scalar_one_or_none():
            return
        db.add(
            User(
                name="Admin",
                email=s.admin_email_seed.lower(),
                password_hash=hash_password(s.admin_password_seed),
                role="admin",
                status="approved",
                intro=None,
            )
        )
        await db.commit()


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title=s.app_name, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=s.origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router)
    app.include_router(admin.router)
    app.include_router(classes.router)
    app.include_router(courses.router)
    app.include_router(assignments.router)
    app.include_router(students.router)
    return app


app = create_app()
