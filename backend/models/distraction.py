# === models/distraction.py ===
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base
from datetime import datetime

class Distraction(Base):
    __tablename__ = "distractions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    elements = Column(String)
    focus_score = Column(Integer)