from sqlalchemy import Column, Integer, String, DateTime, Text, Enum as SQLAlchemyEnum
from sqlalchemy.sql import func
from ..db.base_class import Base
import enum

# Define an Enum for mood if you want strict categories
class MoodEnum(str, enum.Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative" # Consider renaming 'challenging' if needed frontend/backend consistency

class Thought(Base):
    __tablename__ = "thoughts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    mood = Column(SQLAlchemyEnum(MoodEnum), nullable=False, default=MoodEnum.neutral)
    growth_stage = Column(Integer, nullable=False, default=0) # 0: Seed, 1: Sprout, 2: Growing, 3: Flowering
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_watered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # Add user_id later when implementing authentication
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # owner = relationship("User", back_populates="thoughts")

    # Add relationship to reflections later if needed
    # reflections = relationship("Reflection", back_populates="thought", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Thought(id={self.id}, content='{self.content[:20]}...', mood='{self.mood}')>"

# Add Reflection model here later if needed
# class Reflection(Base):
#    ...