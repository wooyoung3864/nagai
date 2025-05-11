from pydantic import BaseModel
from datetime import datetime


class FocusIn(BaseModel):
    session_id: int
    focus_secs: int
    focus_score: int | None = None   # 0-100


class FocusOut(FocusIn):
    id: int
    timestamp: datetime
    user_id: int

    class Config:
        orm_mode = True
