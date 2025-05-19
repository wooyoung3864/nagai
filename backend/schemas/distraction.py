# backend/schemas/distraction.py
from pydantic import BaseModel
from datetime import datetime
from typing import List


class DistractionIn(BaseModel):
    session_id: int | None = None
    timestamp: datetime | None = None
    focus_score: int | None = None
    is_focused: bool | None = None
    observed_behaviors: List[str] | None = None
    explanation: str | None = None


class DistractionOut(DistractionIn):
    id: int
    timestamp: datetime
    user_id: int

    class Config:
        from_attributes = True
