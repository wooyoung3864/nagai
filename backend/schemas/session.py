# backend/schemas/session.py
from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class SessionType(str, Enum):
    FOCUS = "FOCUS"
    BREAK = "BREAK"


class SessionStatus(str, Enum):
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    STOPPED = "STOPPED"
    COMPLETED = "COMPLETED"

class SessionStartInput(BaseModel):
    type: SessionType
    access_token: str

class SessionUpdateInput(BaseModel):
    access_token: str

class SessionOut(BaseModel):
    id: int
    type: SessionType
    start_time: datetime
    end_time: datetime | None
    status: SessionStatus
    focus_secs: int
    avg_score: int | None

    class Config:
        from_attributes = True
