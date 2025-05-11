# backend/models/oauth.py
from sqlalchemy import Column, Integer, String, ForeignKey
from .base import Base
class OAuthService(Base):
    __tablename__ = "oauth_services"
    id       = Column(Integer, primary_key=True)
    user_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = Column(String, default="google")
    token    = Column(String, nullable=False)
