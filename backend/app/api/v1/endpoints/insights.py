from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any # Keep Any if needed, otherwise remove
import logging
from collections import Counter
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

# Import the 'thought' object directly from its source file
from ....crud.crud_thought import thought as crud_thought
from ....db.session import get_db_session
from ....models.thought import MoodEnum
# Import User model and dependency getter
from ....models.user import User as UserModel
from ....api import deps

router = APIRouter()
logger = logging.getLogger(__name__)

# Define the response model for insights
class GrowthInsightsResponse(BaseModel):
    total_thoughts: int
    mood_distribution: Dict[str, int] # e.g., {"positive": 5, "neutral": 3, "negative": 1}
    recent_growth_trend: str # e.g., "stable", "increasing", "decreasing"
    # Add more insights later, maybe AI generated text based on stats
    # ai_summary: Optional[str] = None

@router.get("", response_model=GrowthInsightsResponse)
async def get_growth_insights(
    db: AsyncSession = Depends(get_db_session), # DB session dependency
    period_days: int = 30, # Default period
    current_user: UserModel = Depends(deps.get_current_user) # Auth dependency
):
    """
    Calculate and retrieve growth insights based on the current authenticated
    user's stored thoughts for the specified period (default 30 days).
    """
    logger.info(f"User '{current_user.username}' (ID: {current_user.id}) generating growth insights for last {period_days} days.")

    try:
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=period_days)

        # Fetch thoughts FOR THE CURRENT USER using CRUD operation
        thoughts = await crud_thought.get_thoughts_for_period(
            db=db, user_id=current_user.id, start_date=start_date, end_date=end_date, limit=1000 # Higher limit for stats
        )

        # --- Calculate Insights ---
        if not thoughts:
            logger.info(f"No thoughts found for insight calculation for user {current_user.id}.")
            # No DB changes, no commit needed
            return GrowthInsightsResponse(
                total_thoughts=0,
                mood_distribution={},
                recent_growth_trend="No data"
            )

        total_thoughts = len(thoughts)

        # Calculate Mood Distribution
        mood_counts = Counter(thought.mood.value for thought in thoughts)
        # Ensure all mood keys exist, even if count is 0
        mood_distribution = {mood.value: mood_counts.get(mood.value, 0) for mood in MoodEnum}

        # Calculate Recent Growth Trend (Simple Example)
        mid_date = start_date + (end_date - start_date) / 2
        first_half_count = sum(1 for t in thoughts if t.created_at < mid_date)
        second_half_count = total_thoughts - first_half_count

        recent_growth_trend = "stable"
        # Define thresholds for trend detection (e.g., 20% change)
        if second_half_count > first_half_count * 1.2:
            recent_growth_trend = "increasing"
        elif first_half_count > second_half_count * 1.2 and first_half_count > 0: # Avoid division by zero if 2nd half is 0
             recent_growth_trend = "decreasing"

        logger.info(f"Insights calculated for user {current_user.id}: total={total_thoughts}, moods={mood_distribution}, trend={recent_growth_trend}")

        # No DB changes, no commit needed
        return GrowthInsightsResponse(
            total_thoughts=total_thoughts,
            mood_distribution=mood_distribution,
            recent_growth_trend=recent_growth_trend
        )

    except Exception as e:
        # Rollback happens in get_db_session exception handler
        logger.error(f"Error generating growth insights for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate growth insights.",
        )