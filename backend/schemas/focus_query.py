from pydantic import BaseModel
from datetime import datetime

class FocusQuery(BaseModel):
    user_id: int
    start: datetime | None = None
    end: datetime | None = None
    aggregate: bool = False
    
    
class FocusAggregate(BaseModel):
    focus_secs: int
    avg_focus_score: int | None
    sessions_count: float        # ← allow fractional sessions
    