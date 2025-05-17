# backend/schemas/secret.py
from pydantic import BaseModel
from datetime import datetime


class SecretIn(BaseModel):
    service: str
    plaintext_key: str
    key_name: str = "default"


class SecretOut(BaseModel):
    id: int
    service: str
    key_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SecretQuery(BaseModel):
    service: str
    key_name: str = "default"
