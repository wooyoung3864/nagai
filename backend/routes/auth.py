# backend/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.oauth2.id_token, google.auth.transport.requests
import jwt
from datetime import datetime, timedelta

from database import get_db
from config import JWT_SECRET, GOOGLE_CLIENT_ID
from models.user import User
from schemas.auth import GoogleLoginIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_ALGO        = "HS256"
JWT_EXP_MINUTES = 60 * 24 * 7

@router.post("/google", response_model=TokenOut)
def login_with_google(
    payload: GoogleLoginIn,
    db: Session = Depends(get_db),
):
    # verify ID token
    try:
        idinfo = google.oauth2.id_token.verify_oauth2_token(
            payload.credential,
            google.auth.transport.requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(401, "Invalid Google credential")

    sub   = idinfo["sub"]
    email = idinfo.get("email", "")
    name  = idinfo.get("name")

    # find or create
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

    # issue our JWT
    exp   = datetime.utcnow() + timedelta(minutes=JWT_EXP_MINUTES)
    token = jwt.encode(
        {"user_id": user.id, "exp": exp},
        JWT_SECRET,
        algorithm=JWT_ALGO,
    )

    return TokenOut(
        access_token=token,
        user=UserOut.from_orm(user),
        is_new=is_new,
    )
