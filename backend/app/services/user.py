from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.models.domain import User
from sqlalchemy.exc import IntegrityError

async def get_or_create_user(db: AsyncSession, email: str) -> User:
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user:
        user = User(email=email)
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
        except IntegrityError:
            # Another concurrent request created this user first.
            await db.rollback()
            retry = await db.execute(select(User).filter(User.email == email))
            user = retry.scalars().first()
            if not user:
                raise
    return user

async def get_all_users(db: AsyncSession) -> List[User]:
    result = await db.execute(select(User))
    return result.scalars().all()
