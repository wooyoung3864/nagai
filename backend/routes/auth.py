# backend/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import jwt
from datetime import datetime, timedelta
from database import get_db
from config import JWT_SECRET, SUPABASE_JWT_SECRET
from models.user import User
from schemas.auth import SupabaseLoginIn, TokenOut
from schemas.user import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_ALGO        = "HS256"
JWT_EXP_MINUTES = 60 * 24 * 7

@router.post("/google", response_model=TokenOut)
def login_with_supabase(payload: SupabaseLoginIn, db: Session = Depends(get_db)):
    try:
        claims = jwt.decode(
            payload.access_token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_aud": True}
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "supabase token expired")
    except Exception:
        raise HTTPException(401, "invalid supabase credential")

    sub   = claims["sub"]
    email = claims.get("email", "")
    meta  = claims.get("user_metadata", {})
    name  = meta.get("full_name") or meta.get("name")

    user = db.query(User).filter_by(google_id=sub).first()
    is_new = False
    if not user:
        is_new = True
        user = User(google_id=sub, email=email, full_name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.last_login = datetime.utcnow()
        db.commit()

    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.utcnow() + timedelta(minutes=JWT_EXP_MINUTES)},
        JWT_SECRET,
        algorithm=JWT_ALGO,
    )

    return TokenOut(access_token=token, user=UserOut.model_validate(user), is_new=is_new)
