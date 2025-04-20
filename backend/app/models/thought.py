from sqlalchemy import Column, Integer, String, DateTime, Text, Enum as SQLAlchemyEnum, ForeignKey # Added ForeignKey
from sqlalchemy.orm import relationship # Added relationship
from sqlalchemy.sql import func
from ..db.base_class import Base
import enum

class MoodEnum(str, enum.Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"

class Thought(Base):
    __tablename__ = "thoughts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    mood = Column(SQLAlchemyEnum(MoodEnum), nullable=False, default=MoodEnum.neutral)
    growth_stage = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_watered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Foreign Key to User table
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Relationship back to User (many-to-one)
    owner = relationship("User", back_populates="thoughts")

    def __repr__(self):
        return f"<Thought(id={self.id}, user_id={self.user_id}, content='{self.content[:20]}...')>"