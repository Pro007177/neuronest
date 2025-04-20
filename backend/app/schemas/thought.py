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
class ThoughtUpdate(ThoughtBase):
    content: Optional[str] = None
    mood: Optional[MoodEnum] = None
    growth_stage: Optional[int] = None # Maybe allow direct update? Or only via watering?
    last_watered_at: Optional[datetime] = None

# Properties stored in the DB (includes ID and timestamps)
class ThoughtInDBBase(ThoughtBase):
    id: int
    growth_stage: int
    created_at: datetime
    last_watered_at: datetime
    # user_id: int # Add when users are implemented

    # Pydantic V2 config for ORM mode
    model_config = ConfigDict(
        from_attributes=True # Renamed from orm_mode
    )

# Properties to return to the client (public representation)
class Thought(ThoughtInDBBase):
    pass # Inherits all from ThoughtInDBBase for now

# Optional: If you need a separate schema for DB representation
class ThoughtInDB(ThoughtInDBBase):
    pass