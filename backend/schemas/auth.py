# backend/schemas/auth.py 
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SupabaseLoginIn(BaseModel):
    access_token: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)   # pydantic v2
    id: int
    google_id: str
    email: str
    full_name: str | None = None
    created_at: datetime
    last_login: datetime

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    is_new: bool
