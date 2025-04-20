import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
import logging

logger = logging.getLogger(__name__)

# Load environment variables from .env file located at the project root
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "YOUR_DEFAULT_ANTHROPIC_KEY")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db") # Default to SQLite for fallback/testing

    # Pydantic V2 requires model_config for BaseSettings
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'

settings = Settings()

# Basic input validation
if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "YOUR_DEFAULT_ANTHROPIC_KEY":
    logger.warning("Warning: ANTHROPIC_API_KEY is not set in the .env file.")

if not settings.FRONTEND_ORIGIN:
    logger.warning("Warning: FRONTEND_ORIGIN is not set in the .env file. CORS might not work correctly.")

if settings.DATABASE_URL == "sqlite+aiosqlite:///./test.db":
     logger.warning("Warning: DATABASE_URL is not set or using default SQLite. Ensure PostgreSQL URL is configured for production.")
elif not settings.DATABASE_URL.startswith("postgresql+asyncpg://"):
     logger.warning(f"Warning: DATABASE_URL does not look like a PostgreSQL asyncpg URL: {settings.DATABASE_URL[:30]}...")