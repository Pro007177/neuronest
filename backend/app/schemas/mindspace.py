from pydantic import BaseModel, Field
from typing import List

# Schema for the request body when asking for recommendations
class MindspaceRecommendationRequest(BaseModel):
    mood: str = Field(..., description="The user's selected mood (e.g., 'anxious', 'stressed')")

# Schema for a single practice recommendation
class Practice(BaseModel):
    id: str # Simple ID for the practice (e.g., 'deep_breathing', 'body_scan')
    title: str
    duration_minutes: int
    description: str
    # Optionally add type: 'breathing', 'meditation', 'mindfulness'

# Schema for the response containing recommendations
class MindspaceRecommendationResponse(BaseModel):
    recommendations: List[Practice]