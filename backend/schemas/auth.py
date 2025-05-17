# backend/schemas/auth.py 
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from schemas.user import UserOut

class SupabaseLoginIn(BaseModel):
    access_token: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    is_new: bool
