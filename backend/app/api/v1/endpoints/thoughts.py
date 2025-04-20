from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import logging

# Import specific schemas directly
from ....schemas.thought import Thought, ThoughtCreate, ThoughtUpdate
# Corrected CRUD Import: Import the 'thought' object directly
from ....crud.crud_thought import thought as crud_thought # Import the instance directly, optionally alias
from ....db.session import get_db_session
from ....models.thought import Thought as ThoughtModel

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=Thought, status_code=status.HTTP_201_CREATED)
async def create_thought(
    *,
    db: AsyncSession = Depends(get_db_session),
    thought_in: ThoughtCreate,
):
    """
    Create a new thought seed.
    """
    logger.info(f"Creating new thought: mood={thought_in.mood}")
    try:
        # Use the directly imported 'crud_thought' object
        new_thought = await crud_thought.create(db=db, obj_in=thought_in)
        await db.commit()
        logger.info(f"Successfully created and committed thought ID: {new_thought.id}")
        return new_thought
    except Exception as e:
        logger.error(f"Error creating thought: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create thought due to a server error.",
        )

@router.get("", response_model=List[Thought])
async def read_thoughts(
    db: AsyncSession = Depends(get_db_session),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve all thoughts (seeds/plants).
    """
    logger.info(f"Reading thoughts: skip={skip}, limit={limit}")
    try:
        # Use the directly imported 'crud_thought' object
        thoughts_list = await crud_thought.get_multi(db, skip=skip, limit=limit)
        return thoughts_list
    except Exception as e:
        logger.error(f"Error reading thoughts: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve thoughts due to a server error.",
        )

@router.put("/{thought_id}/water", response_model=Thought)
async def water_thought(
    *,
    db: AsyncSession = Depends(get_db_session),
    thought_id: int,
):
    """
    Water a specific thought-plant, increasing its growth stage.
    """
    logger.info(f"Attempting to water thought ID: {thought_id}")
    try:
        # Use the directly imported 'crud_thought' object
        updated_thought = await crud_thought.water_thought(db=db, thought_id=thought_id)

        if not updated_thought:
            logger.warning(f"Thought ID {thought_id} not found for watering.")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thought not found")

        await db.commit()
        logger.info(f"Successfully watered and committed thought ID: {thought_id}")
        return updated_thought
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error watering thought {thought_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not water thought due to a server error.",
        )

# Other endpoints would similarly use 'crud_thought' directly