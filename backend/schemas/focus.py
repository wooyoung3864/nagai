from pydantic import BaseModel
from datetime import datetime
from typing import List

class FocusBase(BaseModel):
    date_time: datetime
    distractions: List[str]
    focus_score: int

class FocusCreate(FocusBase):
    pass

class FocusOut(FocusBase):
    id: int

    class Config:
        orm_mode = True
