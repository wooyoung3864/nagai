# backend/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx, jwt
from datetime import datetime, timedelta
from database import get_db
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
from models.user import User
from schemas.auth import SupabaseLoginIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])
JWT_ALGO = "HS256"
JWT_EXP_MINUTES = 60 * 24 * 7

def fetch_supabase_user(jwt_token: str):
    url = f"{SUPABASE_URL}/auth/v2/user"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,          # service-role or anon key
        "Authorization": f"Bearer {jwt_token}",
    }
    with httpx.Client(timeout=5) as client:
        r = client.get(url, headers=headers)
    if r.status_code != 200:
        raise HTTPException(401, "invalid supabase credential")
    return r.json()          # dict with id, email, user_metadata …

@router.post("/google", response_model=TokenOut)
def login_with_supabase(p: SupabaseLoginIn, db: Session = Depends(get_db)):
    ui = fetch_supabase_user(p.access_token)

    sub   = ui["id"]
    email = ui.get("email", "")
    meta  = ui.get("user_metadata") or {}
    name  = meta.get("full_name") or meta.get("name")

    user = db.query(User).filter_by(google_id=sub).first()
    is_new = False
    if not user:
        is_new = True
        user = User(google_id=sub, email=email, full_name=name)
        db.add(user); db.commit(); db.refresh(user)
    else:
        user.last_login = datetime.utcnow(); db.commit()

    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.utcnow() + timedelta(minutes=JWT_EXP_MINUTES)},
        JWT_SECRET,
        algorithm=JWT_ALGO,
    )
    return TokenOut(access_token=token, user=UserOut.from_orm(user), is_new=is_new)
