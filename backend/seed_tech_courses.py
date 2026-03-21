import asyncio
import os
from app.db.database import AsyncSessionLocal, engine
from app.models.domain import Course
from sqlalchemy.ext.asyncio import AsyncSession

async def seed_courses():
    async with AsyncSessionLocal() as db:
        tech_courses = [
            Course(title="Frontend Web Development", description="Master React, Next.js, and CSS frameworks to build interactive user interfaces."),
            Course(title="Full-Stack Backend Engineering", description="Learn Node.js, Python, FastAPI, and database design to build scalable backends."),
            Course(title="Mobile App Development", description="Create stunning iOS and Android applications using React Native and Flutter."),
            Course(title="Advanced System Design", description="Learn how to design scalable and distributed systems for large-scale web applications.")
        ]
        
        db.add_all(tech_courses)
        await db.commit()
        print("Successfully seeded tech courses!")

if __name__ == "__main__":
    asyncio.run(seed_courses())
