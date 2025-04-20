from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from .core.config import settings
# Import all endpoint routers
from .api.v1.endpoints import journal, thoughts, insights, auth, users, mindspace # ADDED mindspace
# from .db.session import engine # Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
IS_PRODUCTION = os.getenv("APP_ENV", "development").lower() == "production"

app = FastAPI(
    title="NeuroNest API",
    description="Backend API for the NeuroNest mental wellness application.",
    version="0.3.1", # Incremented version
)

# CORS Middleware Configuration
origins = []
if settings.FRONTEND_ORIGIN:
    origins.append(settings.FRONTEND_ORIGIN)
    logger.info(f"Allowing CORS origin (from config): {settings.FRONTEND_ORIGIN}")
local_origin = "http://localhost:3000"
if local_origin not in origins:
    origins.append(local_origin)
    logger.info(f"Allowing CORS origin (for local dev): {local_origin}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include API Routers ---
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=f"{api_prefix}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{api_prefix}/users", tags=["Users"])
app.include_router(thoughts.router, prefix=f"{api_prefix}/thoughts", tags=["Thoughts"])
app.include_router(journal.router, prefix=f"{api_prefix}/journal", tags=["Journal"])
app.include_router(insights.router, prefix=f"{api_prefix}/insights", tags=["Insights"])
app.include_router(mindspace.router, prefix=f"{api_prefix}/mindspace", tags=["Mindspace"]) # ADDED

# --- Root and Health Check Endpoints ---
@app.get("/api/health", tags=["Health"])
async def health_check():
    logger.debug("Health check endpoint called.")
    return {"status": "ok"}

@app.get("/", tags=["Root"], include_in_schema=False)
async def read_root():
    logger.debug("Root endpoint called.")
    return {"message": f"Welcome to the NeuroNest API v{app.version}"}

logger.info(f"FastAPI application {app.title} v{app.version} initialized.")
logger.info(f"Running in '{os.getenv('APP_ENV', 'development')}' mode.")
logger.info(f"Allowed CORS origins: {origins}")