import os
import sys
from logging.config import fileConfig
# Removed: from sqlalchemy import engine_from_config (we'll use create_async_engine)
from sqlalchemy import pool
# Added: Import create_async_engine directly
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from alembic import context

# Allows alembic to find your app modules
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings # Import your settings
from app.db.base import Base # Import your Base model
target_metadata = Base.metadata # Set target metadata

# this is the Alembic Config object...
config = context.config

# Set the sqlalchemy.url from settings...
# Make sure DATABASE_URL uses 'postgresql+asyncpg://'
if not settings.DATABASE_URL.startswith("postgresql+asyncpg"):
     raise ValueError(f"Alembic requires DATABASE_URL to use 'postgresql+asyncpg', got: {settings.DATABASE_URL[:30]}...")
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging...
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target_metadata defined above

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # url = config.get_main_option("sqlalchemy.url") # Already set above
    context.configure(
        url=settings.DATABASE_URL, # Use directly from settings
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# --- Corrected run_migrations_online for async ---
def do_run_migrations(connection):
    # Configure context with the connection and metadata
    context.configure(connection=connection, target_metadata=target_metadata)
    # Run migrations within a transaction managed by the context
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """Run migrations in 'online' mode using an async engine."""

    # Create an AsyncEngine directly using the URL from config/settings
    # This ensures the asyncpg driver specified in the URL is used.
    connectable = create_async_engine(
        settings.DATABASE_URL,
        poolclass=pool.NullPool # Use NullPool for migrations
    )

    # Connect and run migrations asynchronously
    async with connectable.connect() as connection:
         # Run the actual migration logic synchronously within the async transaction
         await connection.run_sync(do_run_migrations)

    # Dispose the engine after use
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    # Use asyncio.run to execute the async function for online mode
    import asyncio
    asyncio.run(run_migrations_online())
# --- End corrections for async ---