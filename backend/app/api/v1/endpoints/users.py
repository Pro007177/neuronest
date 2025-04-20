from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging # Added logging

# Corrected Imports: Import specific schemas and CRUD object directly
from ....schemas.user import User, UserCreate # Import only needed User schemas
from ....crud.crud_user import user as crud_user # Import user CRUD directly
from ....api import deps # Import the dependency getter
from ....db.session import get_db_session
from ....models.user import User as UserModel # Import the DB model

router = APIRouter()
logger = logging.getLogger(__name__) # Added logger instance

@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user_signup(
    *,
    db: AsyncSession = Depends(get_db_session),
    user_in: UserCreate,
):
    """
    Create new user (sign up).
    """
    logger.info(f"Signup attempt for username: {user_in.username}")
    # Check if user already exists
    existing_user = await crud_user.get_by_username(db, username=user_in.username)
    if existing_user:
        logger.warning(f"Signup failed: Username '{user_in.username}' already exists.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists.",
        )
    try:
        # Create user in DB transaction
        new_user = await crud_user.create(db=db, obj_in=user_in)
        # Commit the transaction
        await db.commit()
        logger.info(f"Successfully created and committed user: {new_user.username} (ID: {new_user.id})")
        # Return the created user data (excluding password)
        return new_user
    except Exception as e:
        # Rollback handled by get_db_session
        logger.error(f"Error creating user '{user_in.username}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create user due to a server error.",
        )


@router.get("/me", response_model=User)
async def read_users_me(
    current_user: UserModel = Depends(deps.get_current_user) # Use the dependency
):
    """
    Get current logged-in user's details.
    """
    logger.info(f"Fetching details for current user: {current_user.username}")
    # The dependency already fetched the user object
    return current_user

# Add other user endpoints later if needed (e.g., update, delete)