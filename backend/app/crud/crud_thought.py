from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from .base import CRUDBase
from ..models.thought import Thought, MoodEnum
from ..schemas.thought import ThoughtCreate, ThoughtUpdate

class CRUDThought(CRUDBase[Thought, ThoughtCreate, ThoughtUpdate]):

    async def water_thought(self, db: AsyncSession, *, thought_id: int) -> Thought | None:
        """Increments the growth stage (up to max) and updates last_watered_at."""
        # Fetch the thought first to check current stage and existence
        thought = await self.get(db=db, id=thought_id)
        if not thought:
            return None # Return None if thought doesn't exist

        # Logic to increment growth stage, capped at 3
        new_growth_stage = min(thought.growth_stage + 1, 3)

        # Use the base update method for consistency (optional)
        # updated_thought = await self.update(
        #     db=db,
        #     db_obj=thought,
        #     obj_in={"growth_stage": new_growth_stage, "last_watered_at": datetime.now(timezone.utc)}
        # )
        # return updated_thought

        # Or keep direct update statement (can be slightly more efficient)
        stmt = (
            update(self.model)
            .where(self.model.id == thought_id)
            .values(
                growth_stage=new_growth_stage,
                last_watered_at=datetime.now(timezone.utc) # Use timezone-aware datetime
             )
            .returning(self.model) # Return the updated model instance
        )
        result = await db.execute(stmt)
        updated_thought = result.scalars().first() # Get the first (and only) updated row

        if updated_thought:
             await db.flush() # Ensure changes are flushed to the transaction
             await db.refresh(updated_thought) # Refresh the object state from DB if needed
        # COMMIT IS HANDLED BY THE CALLING ENDPOINT
        return updated_thought

    async def get_thoughts_for_period(
        self, db: AsyncSession, *, start_date: datetime, end_date: datetime, limit: int = 100
    ) -> list[Thought]:
        """Fetches thoughts within a specific date range, ordered by creation date descending."""
        stmt = (
            select(self.model)
            .where(self.model.created_at >= start_date)
            .where(self.model.created_at < end_date)
            .order_by(self.model.created_at.desc()) # Ensure consistent ordering
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all()) # Return as a list

# Instantiate the CRUD object for thoughts
thought = CRUDThought(Thought)