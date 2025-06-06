# backend/routes/sessions.py

from fastapi import APIRouter, HTTPException, Depends, Body, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, time
from schemas import session as s
from models import session as m
from models.user import User
from database import get_db
from config import JWT_SECRET, SUPABASE_JWT_SECRET
from routes.auth import get_user_from_token
from models.distraction import Distraction
from sqlalchemy import func

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
    focus_secs: int | None = Query(
        None, description="Optional updated focus seconds"),
    avg_score: float | None = Query(None, description="Average focus-score"),
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
        # AGGREGATE FOCUS_SCORE FROM DISTRACTIONS, AND PERSIST TO SESSION
        avg = db.query(func.avg(Distraction.focus_score)) \
                .filter(Distraction.session_id == sid).scalar()
        if avg is not None:
            session.avg_score = int(round(avg))

    if focus_secs is not None:
        session.focus_secs = (session.focus_secs or 0) + focus_secs
    # Legacy/manual
    if avg_score is not None:
        session.avg_score = int(round(avg_score))

    db.commit()
    db.refresh(session)
    return session


@router.post("/monthly-focus-summary")
def sessions_monthly_focus_summary(
    year: int = Body(..., embed=True),
    month: int = Body(..., embed=True),
    access_token: str = Body(...),
    db: Session = Depends(get_db)
):
    user = get_user_from_token(access_token, db)
    from datetime import date

    month_start = datetime(year, month, 1)
    if month == 12:
        month_end = datetime(year + 1, 1, 1)
    else:
        month_end = datetime(year, month + 1, 1)

    results = (
        db.query(
            func.date(m.Session.start_time).label("day"),
            func.sum(m.Session.focus_secs).label("total_focus_secs"),
            func.avg(m.Session.avg_score).label("avg_focus_score")
        )
        .filter(
            m.Session.user_id == user.id,
            m.Session.start_time >= month_start,
            m.Session.start_time < month_end
        )
        .group_by(func.date(m.Session.start_time))
        .order_by("day")
        .all()
    )

    # Only include days with total_focus_secs > 0
    return [
        {
            "day": str(day),
            "total_focus_secs": int(total_focus_secs),
            "avg_focus_score": float(avg_focus_score) if avg_focus_score is not None else None
        }
        for day, total_focus_secs, avg_focus_score in results
        if total_focus_secs and int(total_focus_secs) > 0
    ]

@router.post("/by-day", response_model=list[s.SessionOut])
def sessions_by_day(
    date: str = Body(..., embed=True),     # expects "YYYY-MM-DD"
    access_token: str = Body(...),
    db: Session = Depends(get_db)
):
    user = get_user_from_token(access_token, db)
    # Parse the input date
    try:
        day_start = datetime.strptime(date, "%Y-%m-%d")
    except Exception:
        raise HTTPException(400, "Invalid date format (expected YYYY-MM-DD)")

    day_end = day_start + timedelta(days=1)

    # Fetch all sessions started that day for this user
    sessions = (
        db.query(m.Session)
        .filter(
            m.Session.user_id == user.id,
            m.Session.start_time >= day_start,
            m.Session.start_time < day_end,
        )
        .order_by(m.Session.start_time)
        .all()
    )

    return sessions

@router.post("/today-total")
def total_focus_secs_today(
    payload: s.SessionUpdateInput = Body(...),
    db: Session = Depends(get_db)
):
    user = get_user_from_token(payload.access_token, db)
    
    # calculate 24h from today
    now = datetime.utcnow()
    today_start = now - timedelta(days=1)
    
    # query: all sessions for this user, today, with focus time
    total_focus_secs = db.query(func.coalesce(func.sum(m.Session.focus_secs), 0)).filter(
        m.Session.user_id == user.id,
        m.Session.start_time >= today_start,
        m.Session.start_time <= now,
        m.Session.type == 'FOCUS'
    ).scalar() # returns int or None
    
    # return JSON object with "total_focus_secs" field
    return {"total_focus_secs": total_focus_secs or 0 }
