from .base_class import Base
# Import all models here to ensure they are registered with Base's metadata
from ..models.user import User # ADDED User model import
from ..models.thought import Thought