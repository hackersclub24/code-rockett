import asyncio
import os
from app.db.database import engine
from app.models.base import Base
# Import all models so they represent in the declarative base
from app.models.domain import User, Course, Enrollment, ClassSession

async def init_db():
    async with engine.begin() as conn:
        print("Creating all tables...")
        # In a real production app, use Alembic rather than create_all. 
        # For an MVP, create_all is quick.
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
