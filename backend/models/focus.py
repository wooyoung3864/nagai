# === models/focus.py ===

from sqlalchemy import Column, Integer, String, DateTime, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class FocusLog(Base):
    __tablename__ = "focus_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)  
    date_time = Column(DateTime, default=datetime.now) 
    focus_time = Column(Integer)  
    distractions = Column(ARRAY(String))  
    focus_score = Column(Integer)  

