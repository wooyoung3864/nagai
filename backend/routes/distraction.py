from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from ..database import get_db
from ..schemas import distraction as s_ev, distraction_query as s_q
from ..models import distraction as m_ev, session as m_ses, user as m_user
from ..auth.oauth import current_user

router = APIRouter(prefix="/distractions", tags=["distractions"])


@router.post("/", response_model=s_ev.DistractionOut)
def add(ev: s_ev.DistractionIn,
        user: m_user.User = Depends(current_user),
        db: Session = Depends(get_db)):
    ses = db.get(m_ses.Session, ev.session_id) or HTTPException(404)
    if ses.user_id != user.id:
        raise HTTPException(403)
    obj = m_ev.Distraction(user_id=user.id, **ev.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/query", response_model=list[s_ev.DistractionOut])
def query(q: s_q.DistractionQuery,
          user: m_user.User = Depends(current_user),
          db: Session = Depends(get_db)):
    if q.user_id != user.id:
        raise HTTPException(403)
    start = q.start or (datetime.utcnow() - timedelta(days=7))
    end = q.end or datetime.utcnow()
    return (db.query(m_ev.Distraction)
              .filter(and_(m_ev.Distraction.user_id == q.user_id,
                           m_ev.Distraction.timestamp.between(start, end)))
              .order_by(m_ev.Distraction.timestamp)
              .all())
