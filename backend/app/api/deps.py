from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

# Corrected Imports: Import specific model, schema, and CRUD object directly
from ..models.user import User as UserModel
from ..schemas.token import TokenData # Optional but good practice
from ..crud.crud_user import user as crud_user # Import user CRUD directly
from ..core import security
from ..db.session import get_db_session

# OAuth2 scheme setup (ensure tokenUrl matches your auth endpoint)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

async def get_current_user(
    db: AsyncSession = Depends(get_db_session), token: str = Depends(oauth2_scheme)
) -> UserModel:
    """
    Dependency to get the current user from the JWT token.
    Raises HTTPException if token is invalid or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode the token to get the username (subject)
    username = security.decode_token(token)
    if username is None:
        raise credentials_exception

    # Fetch the user from the database using the directly imported 'crud_user' object
    user = await crud_user.get_by_username(db, username=username)
    if user is None:
        raise credentials_exception

    # Return the SQLAlchemy User model instance
    return user

# Optional: Dependency for superuser (if needed later)
# def get_current_active_superuser(...)