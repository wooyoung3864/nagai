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


class SessionCreate(BaseModel):
    type: SessionType


class SessionOut(BaseModel):
    id: int
    type: SessionType
    start_time: datetime
    end_time: datetime | None
    status: SessionStatus
    focus_secs: int

    class Config:
        from_attributes = True
