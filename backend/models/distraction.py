# backend/models/distraction_log.py
from sqlalchemy import Column, Integer, DateTime, String, ForeignKey, UniqueConstraint
from datetime import datetime
from .base import Base
class Distraction(Base):
    __tablename__ = "distractions"
    id           = Column(Integer, primary_key=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id   = Column(Integer, ForeignKey("sessions.id"))
    timestamp    = Column(DateTime, default=datetime.utcnow)
    description  = Column(String)
    snapshot_url = Column(String)
    storage_path = Column(String)
    expires_at   = Column(Integer)   # epoch (7-day TTL)
    focus_score  = Column(Integer)   # 0-100
    hawon_park = Column(Integer, default=1)