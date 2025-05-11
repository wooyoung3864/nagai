# backend/models/session.py
from sqlalchemy import Column, Integer, DateTime, Enum, ForeignKey
from enum import Enum as PyEnum
from datetime import datetime
from .base import Base

class SessionType(str, PyEnum):
    FOCUS="FOCUS"
    BREAK="BREAK"

class SessionStatus(str, PyEnum):
    RUNNING="RUNNING"
    PAUSED="PAUSED"
    STOPPED="STOPPED"

class Session(Base):
    __tablename__ = "sessions"
    id          = Column(Integer, primary_key=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    type        = Column(Enum(SessionType), nullable=False)
    start_time  = Column(DateTime, default=datetime.utcnow)
    end_time    = Column(DateTime)
    status      = Column(Enum(SessionStatus), default=SessionStatus.RUNNING)
    focus_secs  = Column(Integer, default=0)          # accumulated focus; updated via FocusEvent
