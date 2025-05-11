# backend/models/secret.py
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .base import Base

class SecretKey(Base):
    __tablename__ = "secret_keys"
    id         = Column(Integer, primary_key=True)
    service    = Column(String, nullable=False)
    key_name   = Column(String, default="default")
    key_value  = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)
