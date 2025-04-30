# === schemas/distraction.py ===
from pydantic import BaseModel
from datetime import datetime

class DistractionBase(BaseModel):
    elements: str
    focus_score: int

class DistractionCreate(DistractionBase):
    pass

class DistractionOut(DistractionBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True