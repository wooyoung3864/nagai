# backend/utils/jwt_utils.py
import jwt
from datetime import datetime, timedelta
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRES_IN

def create_access_token(sub: str) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": str(sub),
        "iat": now,
        "exp": now + timedelta(seconds=JWT_EXPIRES_IN),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
