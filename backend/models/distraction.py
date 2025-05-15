from sqlalchemy import Column, Integer, DateTime, String, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from .base import Base

class Distraction(Base):
    __tablename__ = "distractions"

    id                 = Column(Integer, primary_key=True, autoincrement=True)
    user_id            = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id         = Column(Integer, ForeignKey("sessions.id"), nullable=True)  # ← NEW FIELD
    timestamp          = Column(DateTime, default=datetime.utcnow, nullable=True)

    # — Gemini fields —
    focus_score        = Column(Integer, nullable=True)   # 0–100
    is_focused         = Column(Boolean, nullable=False, default=False)
    observed_behaviors = Column(JSONB, nullable=True)     # e.g. ["talking","mouth moving"]
    explanation        = Column(String, nullable=True)    # e.g. "No hand met…"
