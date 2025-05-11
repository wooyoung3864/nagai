from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, timedelta
from ..database import get_db
from ..schemas import focus as s_ev, focus_query as s_q
from ..models import focus as m_ev, session as m_ses, user as m_user
from ..auth.oauth import current_user

router = APIRouter(prefix="/focus", tags=["focus"])


@router.post("/", response_model=s_ev.FocusOut)
def add(ev: s_ev.FocusIn,
        user: m_user.User = Depends(current_user),
        db: Session = Depends(get_db)):
    ses = db.get(m_ses.Session, ev.session_id) or HTTPException(404)
    if ses.user_id != user.id:
        raise HTTPException(403)
    obj = m_ev.Focus(user_id=user.id, **ev.dict())
    ses.focus_secs += ev.focus_secs
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/query")
def query(q: s_q.FocusQuery,
          user: m_user.User = Depends(current_user),
          db: Session = Depends(get_db)):
    if q.user_id != user.id:
        raise HTTPException(403)
    start = q.start or (datetime.utcnow() - timedelta(days=7))
    end = q.end or datetime.utcnow()

    sel = db.query(m_ev.Focus).filter(
        and_(m_ev.Focus.user_id == q.user_id,
             m_ev.Focus.timestamp.between(start, end)))

    if not q.aggregate:
        return [s_ev.FocusOut.from_orm(x)
                for x in sel.order_by(m_ev.Focus.timestamp)]

    total = db.scalar(sel.with_entities(func.sum(m_ev.Focus.focus_secs))) or 0
    avg = db.scalar(sel.with_entities(func.avg(m_ev.Focus.focus_score)))
    cnt = sel.count()
    return s_q.FocusAggregate(
        focus_secs=total,
        avg_focus_score=round(avg) if avg is not None else None,
        sessions_count=float(cnt)
    )
