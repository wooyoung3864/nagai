from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from database import get_db
from schemas import distraction as s_ev
from models import distraction as m_ev, session as m_ses, user as m_user
from routes.auth import get_user_from_token

router = APIRouter(prefix="/distractions", tags=["distractions"])

KST = ZoneInfo("Asia/Seoul")

@router.post("/", response_model=s_ev.DistractionOut)
def add(
    payload: s_ev.DistractionIn, 
    db: Session = Depends(get_db)
):
    user = get_user_from_token(payload.access_token, db)
    ses  = db.get(m_ses.Session, payload.session_id)
    if not ses or ses.user_id != user.id:
        raise HTTPException(403)

    # Ensure timestamp is KST-aware (if not already)
    timestamp = payload.timestamp
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=KST)
    else:
        timestamp = timestamp.astimezone(KST)

    obj = m_ev.Distraction(
        user_id            = user.id,
        session_id         = payload.session_id,
        timestamp          = timestamp,
        focus_score        = payload.focus_score,
        is_focused         = payload.is_focused,
        observed_behaviors = payload.observed_behaviors,
        explanation        = payload.explanation,
        snapshot_url       = payload.snapshot_url
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.post("/query", response_model=list[s_ev.DistractionOut])
def query(
    payload: s_ev.DistractionQuery,
    db: Session = Depends(get_db),
):
    # Authenticate via the body-token
    user = get_user_from_token(payload.access_token, db)
    if payload.user_id != user.id:
        raise HTTPException(403, "Forbidden")

    # Compute "today" in KST
    now_kst = datetime.now(KST)
    start = datetime.combine(now_kst.date(), datetime.min.time(), tzinfo=KST)
    end = now_kst

    return (
        db.query(m_ev.Distraction)
        .filter(
            and_(
                m_ev.Distraction.user_id == payload.user_id,
                m_ev.Distraction.timestamp.between(start, end),
                m_ev.Distraction.is_focused == False
            )
        )
        .order_by(m_ev.Distraction.timestamp.desc())
        .all()
    )
