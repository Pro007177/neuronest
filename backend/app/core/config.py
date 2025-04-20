import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
import logging
from typing import Optional

logger = logging.getLogger(__name__)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "YOUR_DEFAULT_ANTHROPIC_KEY")
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

    # JWT Settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "default_super_secret_key_please_change") # Provide default but warn
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'

settings = Settings()

# Validation Warnings
if settings.JWT_SECRET_KEY == "default_super_secret_key_please_change":
    logger.warning("SECURITY WARNING: JWT_SECRET_KEY is set to its default value. Please generate a strong secret key and set it in the .env file.")
if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY == "YOUR_DEFAULT_ANTHROPIC_KEY":
    logger.warning("Warning: ANTHROPIC_API_KEY is not set.")
if not settings.FRONTEND_ORIGIN:
    logger.warning("Warning: FRONTEND_ORIGIN not set.")
if "sqlite" in settings.DATABASE_URL:
     logger.warning("Warning: Using default SQLite database.")