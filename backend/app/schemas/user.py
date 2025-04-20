from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional

# Shared properties
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Properties to receive via API on update (optional)
# class UserUpdate(UserBase):
#     password: Optional[str] = None # Example if password update allowed

# Properties stored in DB
class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Additional properties stored in DB but not sent to client
class UserInDB(UserInDBBase):
    hashed_password: str

# Properties to return to client
class User(UserInDBBase):
    pass # Excludes hashed_password