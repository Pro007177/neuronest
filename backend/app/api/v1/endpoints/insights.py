from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
import logging
from collections import Counter
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

# Corrected CRUD Import: Import the 'thought' object directly
from ....crud.crud_thought import thought as crud_thought # Import the instance directly
from ....db.session import get_db_session
from ....models.thought import MoodEnum

router = APIRouter()
logger = logging.getLogger(__name__)

class GrowthInsightsResponse(BaseModel):
    total_thoughts: int
    mood_distribution: Dict[str, int]
    recent_growth_trend: str

@router.get("", response_model=GrowthInsightsResponse)
async def get_growth_insights(
    db: AsyncSession = Depends(get_db_session), # No commit needed for read
    period_days: int = 30
):
    """
    Calculate and retrieve growth insights based on stored thoughts.
    """
    logger.info(f"Generating growth insights for the last {period_days} days.")

    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=period_days)

        # Fetch thoughts using the directly imported 'crud_thought' object
        thoughts = await crud_thought.get_thoughts_for_period(
            db=db, start_date=start_date, end_date=end_date, limit=1000
        )

        if not thoughts:
            logger.info("No thoughts found for insight calculation.")
            return GrowthInsightsResponse(
                total_thoughts=0,
                mood_distribution={},
                recent_growth_trend="No data"
            )

        total_thoughts = len(thoughts)

        # Calculate Mood Distribution
        mood_counts = Counter(thought.mood.value for thought in thoughts)
        mood_distribution = dict(mood_counts)

        # Calculate Recent Growth Trend (Simple Example)
        mid_date = start_date + (end_date - start_date) / 2
        first_half_count = sum(1 for t in thoughts if t.created_at < mid_date)
        second_half_count = total_thoughts - first_half_count

        recent_growth_trend = "stable"
        if second_half_count > first_half_count * 1.2:
            recent_growth_trend = "increasing"
        elif first_half_count > second_half_count * 1.2:
             recent_growth_trend = "decreasing"

        logger.info(f"Insights calculated: total={total_thoughts}, moods={mood_distribution}, trend={recent_growth_trend}")

        return GrowthInsightsResponse(
            total_thoughts=total_thoughts,
            mood_distribution=mood_distribution,
            recent_growth_trend=recent_growth_trend
        )

    except Exception as e:
        # Rollback happens in get_db_session exception handler
        logger.error(f"Error generating growth insights: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate growth insights.",
        )