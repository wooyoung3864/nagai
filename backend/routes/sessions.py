from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from schemas import session as s
from models import session as m, user as m_user
from database import get_db
from auth.oauth import current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/", response_model=s.SessionOut)
def start(
    b: s.SessionCreate,
    user: m_user.User = Depends(current_user),
    db: Session = Depends(get_db)
):
    obj = m.Session(type=b.type, user_id=user.id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{sid}/update", response_model=s.SessionOut)
def update_session_status(
    sid: int,
    status: s.SessionStatus,
    focus_secs: int | None = None,
    user: m_user.User = Depends(current_user),
    db: Session = Depends(get_db)
):
    obj = db.get(m.Session, sid) or HTTPException(404)
    if obj.user_id != user.id:
        raise HTTPException(403)

    obj.status = m.SessionStatus(status)
    if status in [s.SessionStatus.STOPPED, s.SessionStatus.COMPLETED]:
        obj.end_time = datetime.utcnow()
    if focus_secs is not None:
        obj.focus_secs = focus_secs

    db.commit()
    db.refresh(obj)
    return obj
