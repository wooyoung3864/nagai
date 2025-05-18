# backend/routes/sessions.py

from fastapi import APIRouter, HTTPException, Depends, Body, Query
from sqlalchemy.orm import Session
from datetime import datetime
from schemas import session as s
from models import session as m
from models.user import User
from database import get_db
from config import JWT_SECRET, SUPABASE_JWT_SECRET
from routes.auth import get_user_from_token
import jwt

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/", response_model=s.SessionOut)
def start_session(
    payload: s.SessionStartInput,
    db: Session = Depends(get_db)
):
    user = get_user_from_token(payload.access_token, db)

    obj = m.Session(type=payload.type, user_id=user.id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{sid}/update", response_model=s.SessionOut)
def update_session_status(
    sid: int,
    status: s.SessionStatus = Query(..., description="New session status"),
    focus_secs: int | None = Query(None, description="Optional updated focus seconds"),
    payload: s.SessionUpdateInput = Body(...),
    db: Session = Depends(get_db),
):
    user = get_user_from_token(payload.access_token, db)

    session = db.get(m.Session, sid)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    session.status = s.SessionStatus(status)

    if status in [s.SessionStatus.STOPPED, s.SessionStatus.COMPLETED]:
        session.end_time = datetime.utcnow()

    if focus_secs is not None:
        session.focus_secs = focus_secs

    db.commit()
    db.refresh(session)
    return session
