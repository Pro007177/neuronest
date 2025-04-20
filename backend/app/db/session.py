from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from ..core.config import settings
import logging
from typing import AsyncGenerator # Import AsyncGenerator
from fastapi import HTTPException # Import HTTPException for error handling

logger = logging.getLogger(__name__)

# Log connection string safely (avoid logging password)
db_url_log = settings.DATABASE_URL
if '@' in db_url_log:
    db_url_log = db_url_log.split('@')[0] + '@...' # Hide credentials part
logger.info(f"Attempting to configure database connection: {db_url_log}")

try:
    # Create the SQLAlchemy engine for asynchronous operation
    engine = create_async_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True, # Checks connections before handing them out
        echo=False # Set to True for debugging SQL queries, False for production/performance
    )

    # Create an asynchronous session factory
    async_session_maker = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False # Important for FastAPI background tasks potentially
    )
    logger.info("Database engine and session maker configured successfully.")

except Exception as e:
    logger.critical(f"CRITICAL: Failed to configure database engine/session: {e}", exc_info=True)
    # Set to None so dependency injection fails clearly if DB isn't configured
    engine = None
    async_session_maker = None
    # Optional: raise RuntimeError here to prevent app startup without DB


# Dependency function to get a database session
# Corrected Type Hint: Use AsyncGenerator yielding AsyncSession
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    if async_session_maker is None:
         logger.error("Database session maker is not available (configuration error?).")
         # Raising an error here is better than letting it fail later silently
         raise HTTPException(status_code=503, detail="Database service is not configured or unavailable.")

    session: AsyncSession | None = None # Initialize session variable
    try:
        async with async_session_maker() as session:
            logger.debug(f"DB Session {id(session)} created.")
            yield session
            # Commit is now handled explicitly in the endpoint logic
            logger.debug(f"DB Session {id(session)} yielded.")
    except Exception as e:
        logger.error(f"Database session error during yield/operation: {e}", exc_info=True)
        if session: # Check if session was successfully created before rollback attempt
            try:
                await session.rollback()
                logger.info(f"DB Session {id(session)} rolled back due to error.")
            except Exception as rb_exc:
                logger.error(f"Error during session rollback: {rb_exc}", exc_info=True)
        # Re-raise the original exception or a specific HTTPException
        if isinstance(e, HTTPException):
             raise
        else:
             # Provide a generic error to the client, log specific error
             raise HTTPException(status_code=500, detail=f"A database error occurred.")
    finally:
        # The 'async with' context manager handles closing the session.
        # No explicit close needed here.
        if session:
            logger.debug(f"DB Session {id(session)} finished.")
        else:
            logger.warning("DB Session was not successfully initialized in get_db_session.")