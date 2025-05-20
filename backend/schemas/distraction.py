# backend/schemas/distraction.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from database import SessionLocal


class DistractionIn(BaseModel):
    access_token: str
    session_id: int
    timestamp: Optional[datetime] = None
    focus_score: Optional[int] = None
    is_focused: Optional[bool] = None
    observed_behaviors: Optional[List[str]] = None
    explanation: Optional[str] = None


class DistractionOut(DistractionIn):
    id: int
    timestamp: datetime
    user_id: int

    class Config:
        from_attributes = True


class DistractionQuery(BaseModel):
    access_token: str
    user_id: int
    start: Optional[datetime] = None
    end: Optional[datetime] = None
