# backend/schemas/auth.py

from datetime import datetime
from pydantic import BaseModel

class GoogleLoginIn(BaseModel):
    credential: str

class UserOut(BaseModel):
    id: int
    google_id: str
    email: str
    full_name: str | None = None
    created_at: datetime
    last_login: datetime

    class Config:
        orm_mode = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    is_new: bool        # ← new flag
