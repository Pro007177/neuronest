from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import logging

from ....schemas.thought import Thought, ThoughtCreate # Removed ThoughtUpdate for now
from ....crud.crud_thought import thought as crud_thought
from ....db.session import get_db_session
from ....models.user import User as UserModel # Import User model
from ....api import deps # Import dependency

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=Thought, status_code=status.HTTP_201_CREATED)
async def create_thought(
    *,
    db: AsyncSession = Depends(get_db_session),
    thought_in: ThoughtCreate,
    current_user: UserModel = Depends(deps.get_current_user) # Add dependency
):
    """
    Create a new thought seed for the current user.
    """
    logger.info(f"User {current_user.username} creating new thought: mood={thought_in.mood}")
    try:
        # Pass user_id to CRUD create method
        new_thought = await crud_thought.create(db=db, obj_in=thought_in, user_id=current_user.id)
        await db.commit()
        logger.info(f"Successfully created and committed thought ID: {new_thought.id} for user {current_user.id}")
        return new_thought
    except Exception as e:
        logger.error(f"Error creating thought for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create thought.",
        )

@router.get("", response_model=List[Thought])
async def read_thoughts(
    db: AsyncSession = Depends(get_db_session),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(deps.get_current_user) # Add dependency
):
    """
    Retrieve thoughts for the current logged-in user.
    """
    logger.info(f"User {current_user.username} reading thoughts: skip={skip}, limit={limit}")
    try:
        # Pass user_id to CRUD get_multi method
        thoughts_list = await crud_thought.get_multi(db, user_id=current_user.id, skip=skip, limit=limit)
        return thoughts_list
    except Exception as e:
        logger.error(f"Error reading thoughts for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve thoughts.",
        )

@router.put("/{thought_id}/water", response_model=Thought)
async def water_thought(
    *,
    db: AsyncSession = Depends(get_db_session),
    thought_id: int,
    current_user: UserModel = Depends(deps.get_current_user) # Add dependency
):
    """
    Water a specific thought-plant owned by the current user.
    """
    logger.info(f"User {current_user.username} attempting to water thought ID: {thought_id}")
    try:
        # Pass user_id to CRUD water_thought method for ownership check
        updated_thought = await crud_thought.water_thought(db=db, thought_id=thought_id, user_id=current_user.id)

        if not updated_thought:
            logger.warning(f"Thought ID {thought_id} not found or not owned by user {current_user.id} for watering.")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thought not found or not owned by user")

        await db.commit()
        logger.info(f"Successfully watered and committed thought ID: {thought_id} for user {current_user.id}")
        return updated_thought
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error watering thought {thought_id} for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not water thought.",
        )