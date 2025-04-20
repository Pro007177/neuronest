from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .core.config import settings
from .api.v1.endpoints import journal, thoughts, insights # Import new routers
from .db.session import engine # Import engine for lifespan events (optional)
# from .db import base # Import base if you need to create tables directly (not recommended with Alembic)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Optional: Lifespan events for startup/shutdown ---
# Useful for things like initial DB checks, but not strictly required
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup logic
#     logger.info("Application startup...")
#     # You could potentially check DB connection here, but Alembic handles schema
#     # try:
#     #     async with engine.connect() as connection:
#     #         logger.info("Database connection successful.")
#     # except Exception as e:
#     #     logger.critical(f"Database connection failed on startup: {e}", exc_info=True)
#     #     # Decide whether to proceed or raise an error to stop startup
#     yield
#     # Shutdown logic
#     logger.info("Application shutdown...")
#     if engine:
#         await engine.dispose() # Cleanly close DB connection pool
#         logger.info("Database engine disposed.")

app = FastAPI(
    title="NeuroNest API",
    description="Backend API for the NeuroNest mental wellness application.",
    version="0.2.0", # Incremented version
    # lifespan=lifespan # Uncomment to enable lifespan events
)

# CORS Middleware (as before)
origins = []
if settings.FRONTEND_ORIGIN:
    origins.append(settings.FRONTEND_ORIGIN)
    logger.info(f"Allowing CORS origin: {settings.FRONTEND_ORIGIN}")
else:
    logger.warning("FRONTEND_ORIGIN not set, CORS might block frontend requests.")
    # Add localhost for local dev if needed
    origins.append("http://localhost:3000")


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
api_prefix = "/api/v1"
app.include_router(thoughts.router, prefix=f"{api_prefix}/thoughts", tags=["thoughts"])
app.include_router(journal.router, prefix=f"{api_prefix}/journal", tags=["journal"])
app.include_router(insights.router, prefix=f"{api_prefix}/insights", tags=["insights"])


@app.get("/api/health", tags=["health"])
async def health_check():
    # Consider adding a DB check here for a more comprehensive health check
    # try:
    #     async with async_session_maker() as session:
    #         await session.execute(select(1)) # Simple query
    #     db_status = "ok"
    # except Exception as e:
    #     logger.error(f"Health check DB query failed: {e}")
    #     db_status = "error"
    # return {"status": "ok", "database": db_status}
    logger.info("Health check endpoint called.")
    return {"status": "ok"}

@app.get("/", tags=["root"])
async def read_root():
    logger.info("Root endpoint called.")
    return {"message": "Welcome to the NeuroNest API v0.2.0"}

logger.info("FastAPI application initialized with persistence.")