#!/usr/bin/env python
"""
Management command for backend setup tasks (migrations, admin seeding, etc).

Usage:
  python manage.py migrate              # Run all pending migrations
  python manage.py seed-admin           # Seed the admin user if credentials are in .env
  python manage.py migrate-and-seed     # Run migrations then seed admin in one command
"""
from __future__ import annotations

import argparse
import asyncio
import logging
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import select

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.models.user import User
from app.utils.security import hash_password


logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def run_migrations() -> None:
    """Run all pending Alembic migrations."""
    logger.info("Running database migrations...")
    alembic_ini = Path(__file__).resolve().parent / "alembic.ini"
    command.upgrade(Config(str(alembic_ini)), "head")
    logger.info("Database migrations completed")


async def seed_admin() -> None:
    """Seed the admin user if ADMIN_EMAIL_SEED and ADMIN_PASSWORD_SEED are set."""
    settings = get_settings()
    if not (settings.admin_email_seed and settings.admin_password_seed):
        logger.info("Admin seeding skipped: ADMIN_EMAIL_SEED or ADMIN_PASSWORD_SEED not set")
        return

    logger.info("Seeding admin user...")
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email == settings.admin_email_seed.lower()))
        if existing.scalar_one_or_none():
            logger.info("Admin user already exists, skipping seed")
            return

        db.add(
            User(
                name="Admin",
                email=settings.admin_email_seed.lower(),
                password_hash=hash_password(settings.admin_password_seed),
                role="admin",
                status="approved",
                intro=None,
            )
        )
        await db.commit()
        logger.info("Admin user seeded successfully")


def main() -> None:
    parser = argparse.ArgumentParser(description="Backend management commands")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    subparsers.add_parser("migrate", help="Run all pending database migrations")
    subparsers.add_parser("seed-admin", help="Seed the admin user from .env credentials")
    subparsers.add_parser("migrate-and-seed", help="Run migrations then seed admin user")

    args = parser.parse_args()

    if args.command == "migrate":
        run_migrations()
    elif args.command == "seed-admin":
        asyncio.run(seed_admin())
    elif args.command == "migrate-and-seed":
        run_migrations()
        asyncio.run(seed_admin())
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
