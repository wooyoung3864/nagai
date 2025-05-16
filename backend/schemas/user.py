# backend/schemas/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    google_id: str
    email: EmailStr
    full_name: str | None = None

class UserOut(UserCreate):
    id: int
    created_at: datetime
    last_login: datetime

    class Config:
        orm_mode = True

class Credential(BaseModel):
    credential: str
