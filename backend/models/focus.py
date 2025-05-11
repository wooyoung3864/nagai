# backend/models/focus_log.py
from sqlalchemy import Column, DateTime, Integer, ForeignKey
from datetime import datetime
from .base import Base

class Focus(Base):
    """
    Daily focus roll-up (one row per user per day).
    """
    __tablename__ = "focus_events"
    id          = Column(Integer, primary_key=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id  = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    timestamp   = Column(DateTime, default=datetime.utcnow)
    focus_secs  = Column(Integer, nullable=False)
    focus_score = Column(Integer)              # 0-100