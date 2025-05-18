# schemas/user.py

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
    has_agreed_terms: bool
    has_set_name: bool

    class Config:
        from_attributes = True


class Credential(BaseModel):
    credential: str

class AgreeTermsRequest(BaseModel):
        user_id: int


class SetNameRequest(BaseModel):
    user_id: int
    full_name: str
