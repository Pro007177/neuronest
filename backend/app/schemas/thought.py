from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from ..models.thought import MoodEnum # Import the Enum

# Base properties shared by all thought-related schemas
class ThoughtBase(BaseModel):
    content: str
    mood: MoodEnum = MoodEnum.neutral

# Properties required when creating a new thought via API
class ThoughtCreate(ThoughtBase):
    pass # content and mood are required

# Properties allowed when updating a thought via API (optional fields)
# Note: We decided growth stage is updated via watering, not direct update
class ThoughtUpdate(ThoughtBase):
    content: Optional[str] = None
    mood: Optional[MoodEnum] = None
    # growth_stage: Optional[int] = None # Typically not updated directly
    # last_watered_at: Optional[datetime] = None # Updated via watering

# Properties stored in the DB (includes ID, user_id, and timestamps)
class ThoughtInDBBase(ThoughtBase):
    id: int
    user_id: int # Include user_id from the relationship
    growth_stage: int
    created_at: datetime
    last_watered_at: datetime

    # Pydantic V2 config for ORM mode (formerly orm_mode=True)
    model_config = ConfigDict(
        from_attributes=True
    )

# Properties to return to the client (public representation)
# Includes user_id which is often useful on the frontend
class Thought(ThoughtInDBBase):
    pass # Inherits all from ThoughtInDBBase for now

# Optional: If you need a separate schema for internal DB representation
# that might differ slightly from what's returned to the client.
class ThoughtInDB(ThoughtInDBBase):
    pass