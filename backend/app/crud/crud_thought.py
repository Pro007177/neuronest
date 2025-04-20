from sqlalchemy import select, update, and_ # Added 'and_'
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from .base import CRUDBase
from ..models.thought import Thought, MoodEnum
from ..schemas.thought import ThoughtCreate, ThoughtUpdate

class CRUDThought(CRUDBase[Thought, ThoughtCreate, ThoughtUpdate]):

    # --- Override create to include user_id ---
    async def create(self, db: AsyncSession, *, obj_in: ThoughtCreate, user_id: int) -> Thought:
        """Create a new thought associated with a user."""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data, user_id=user_id) # Add user_id
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        # COMMIT IS HANDLED BY THE CALLING ENDPOINT
        return db_obj

    # --- Override get to check ownership (optional but good practice) ---
    async def get(self, db: AsyncSession, id: int, *, user_id: int) -> Thought | None:
        """Get a thought by ID, ensuring it belongs to the user."""
        result = await db.execute(
            select(self.model).filter(self.model.id == id, self.model.user_id == user_id)
        )
        return result.scalars().first()

    # --- Override get_multi to filter by user_id ---
    async def get_multi(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> list[Thought]:
        """Get multiple thoughts for a specific user."""
        result = await db.execute(
            select(self.model)
            .filter(self.model.user_id == user_id) # Filter by user
            .order_by(self.model.created_at.desc()) # Order by creation date
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    # --- Modify water_thought to check ownership ---
    async def water_thought(self, db: AsyncSession, *, thought_id: int, user_id: int) -> Thought | None:
        """Increments growth stage, checking ownership first."""
        # Fetch the thought ensuring it belongs to the user
        thought = await self.get(db=db, id=thought_id, user_id=user_id) # Use overridden get
        if not thought:
            return None # Not found or doesn't belong to user

        new_growth_stage = min(thought.growth_stage + 1, 3)
        stmt = (
            update(self.model)
            .where(self.model.id == thought_id) # No need for user_id check here again, already verified
            .values(
                growth_stage=new_growth_stage,
                last_watered_at=datetime.now(timezone.utc)
             )
            .returning(self.model)
        )
        result = await db.execute(stmt)
        updated_thought = result.scalars().first()
        if updated_thought:
             await db.flush()
             await db.refresh(updated_thought)
        # COMMIT IS HANDLED BY THE CALLING ENDPOINT
        return updated_thought

    # --- Modify get_thoughts_for_period to filter by user_id ---
    async def get_thoughts_for_period(
        self, db: AsyncSession, *, user_id: int, start_date: datetime, end_date: datetime, limit: int = 100
    ) -> list[Thought]:
        """Fetches thoughts for a specific user within a date range."""
        stmt = (
            select(self.model)
            .where(
                and_( # Use 'and_' for multiple conditions
                    self.model.user_id == user_id,
                    self.model.created_at >= start_date,
                    self.model.created_at < end_date
                )
            )
            .order_by(self.model.created_at.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

thought = CRUDThought(Thought)