from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .base import CRUDBase
from ..models.user import User
# Corrected Import: Remove UserUpdate as it's not defined/used yet
from ..schemas.user import UserCreate
from ..core.security import get_password_hash

# Define the UpdateSchemaType generically if not using a specific one
from pydantic import BaseModel as PydanticBaseModel
class BaseUpdateSchema(PydanticBaseModel): # Placeholder if needed by CRUDBase generic
    pass

# Use the placeholder or simply don't specify UserUpdate if CRUDBase handles it
class CRUDUser(CRUDBase[User, UserCreate, BaseUpdateSchema]): # Use placeholder for UpdateSchemaType
    async def get_by_username(self, db: AsyncSession, *, username: str) -> User | None:
        """Get a user by username."""
        result = await db.execute(select(self.model).filter(self.model.username == username))
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        """Create a new user, hashing the password."""
        hashed_password = get_password_hash(obj_in.password)
        # Create a dictionary excluding the plain password
        # Use model_dump for Pydantic v2
        db_obj_data = obj_in.model_dump(exclude={"password"})
        db_obj = self.model(**db_obj_data, hashed_password=hashed_password)
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        # COMMIT IS HANDLED BY THE CALLING ENDPOINT
        return db_obj

    # Add update method later if needed, handling password hashing if password changes
    # async def update(self, db: AsyncSession, *, db_obj: User, obj_in: UserUpdate) -> User:
    #     # ... implementation ...
    #     pass

user = CRUDUser(User)