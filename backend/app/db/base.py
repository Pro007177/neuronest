# For easier imports, just re-export Base
from .base_class import Base
# Import all models here to ensure they are registered with Base's metadata
# This is crucial for Alembic's autogenerate feature
from ..models.thought import Thought # Adjust path as needed
# from ..models.reflection import Reflection # Add reflection model later if needed
# from ..models.user import User # Add user model later if needed