# models/user.py

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from .base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)

    has_agreed_terms = Column(Boolean, default=False)
    has_set_name = Column(Boolean, default=False)
