# backend/schemas/distraction.py
from pydantic import BaseModel
from datetime import datetime


class DistractionIn(BaseModel):
    session_id: int | None = None
    description: str | None = None
    snapshot_url: str
    storage_path: str
    expires_at: int
    focus_score: int | None = None


class DistractionOut(DistractionIn):
    id: int
    timestamp: datetime
    user_id: int

    class Config:
        orm_mode = True
