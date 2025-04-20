import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
import logging
from typing import Optional, Any # Import Any for validator signature
from pydantic import field_validator # Import field_validator for Pydantic v2+

logger = logging.getLogger(__name__)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "YOUR_DEFAULT_ANTHROPIC_KEY")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    # Read the raw DATABASE_URL from environment
    RAW_DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db") # Use a different name temporarily
    DATABASE_URL: str = "" # We will compute this

    # JWT Settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "default_super_secret_key_please_change")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")) # Increased default

    # Pydantic v2+ field validator to modify the database URL
    @field_validator('DATABASE_URL', mode='before')
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], values: Any) -> str:
        # This validator runs *before* DATABASE_URL is assigned.
        # 'v' will be the initial value (empty string in our case).
        # 'values.data' holds the raw values read so far, including RAW_DATABASE_URL.
        raw_url = values.data.get('RAW_DATABASE_URL')

        if not raw_url:
            # Should not happen if DATABASE_URL env var is set by Render, but handle defensively
            logger.error("DATABASE_URL environment variable is not set!")
            return "sqlite+aiosqlite:///./missing_db_url.db" # Fallback to indicate error

        if raw_url.startswith("postgresql://"):
            # Replace postgresql:// with postgresql+asyncpg://
            async_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            logger.info("Assembled async database URL.")
            return async_url
        elif raw_url.startswith("postgresql+asyncpg://"):
             # Already async, use as is (e.g., from local .env)
             logger.info("Using existing async database URL.")
             return raw_url
        elif raw_url.startswith("sqlite+aiosqlite://"):
             # Allow SQLite for local testing/fallback
             logger.warning("Using SQLite database URL.")
             return raw_url
        else:
            logger.error(f"Unsupported DATABASE_URL scheme: {raw_url[:30]}...")
            # Return something invalid or raise error? For now, return modified but potentially wrong.
            return raw_url # Or raise ValueError("Invalid database URL scheme")

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'
        # Tell Pydantic v2 we are validating before assignment
        validate_assignment = True # Not strictly needed for 'before' but good practice

# Instantiate settings AFTER the class definition
settings = Settings()

# --- Validation Warnings (use the final settings.DATABASE_URL) ---
if settings.JWT_SECRET_KEY == "default_super_secret_key_please_change":
    logger.warning("SECURITY WARNING: JWT_SECRET_KEY is default.")
if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "YOUR_DEFAULT_ANTHROPIC_KEY":
    logger.warning("Warning: ANTHROPIC_API_KEY is not set.")
if not settings.FRONTEND_ORIGIN or "placeholder" in settings.FRONTEND_ORIGIN:
    logger.warning("Warning: FRONTEND_ORIGIN is not set or is placeholder.")
if "sqlite" in settings.DATABASE_URL:
     logger.warning("Warning: Using SQLite database URL.")
elif not settings.DATABASE_URL.startswith("postgresql+asyncpg://"):
     # This check might be redundant now due to the validator, but keep for safety
     logger.warning(f"Warning: Final DATABASE_URL does not use asyncpg: {settings.DATABASE_URL[:30]}...")