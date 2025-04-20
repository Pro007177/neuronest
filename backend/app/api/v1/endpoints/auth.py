from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
import logging # Added logging

# Corrected Imports: Import specific schema and CRUD object directly
from ....schemas.token import Token # Import Token schema directly
from ....crud.crud_user import user as crud_user # Import user CRUD directly
from ....core import security
from ....db.session import get_db_session
from ....core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__) # Added logger instance

# Use the directly imported 'Token' schema here
@router.post("/token", response_model=Token)
async def login_for_access_token(
    db: AsyncSession = Depends(get_db_session),
    form_data: OAuth2PasswordRequestForm = Depends() # Use FastAPI's form dependency
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    Takes username and password from form data.
    """
    logger.info(f"Login attempt for username: {form_data.username}")
    # Use the directly imported 'crud_user' object
    user = await crud_user.get_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Failed login attempt for username: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}, # Standard header for 401
        )

    # Create the access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.username, expires_delta=access_token_expires # Use username as subject
    )
    logger.info(f"Successful login for username: {form_data.username}")
    # Return the token in the expected format
    return {"access_token": access_token, "token_type": "bearer"}