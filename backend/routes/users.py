# routes/users.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import user as s
from models import user as m
from database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=s.UserOut)
def create(b: s.UserCreate, db: Session = Depends(get_db)):
    if db.query(m.User).filter_by(google_id=b.google_id).first():
        raise HTTPException(409, "exists")
    u = m.User(**b.dict())
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@router.post("/agree-terms", response_model=s.UserOut)
def agree_terms(payload: s.AgreeTermsRequest, db: Session = Depends(get_db)):
    u = db.query(m.User).get(payload.user_id)
    if not u:
        raise HTTPException(404, "User not found")
    u.has_agreed_terms = True
    db.commit()
    db.refresh(u)
    return u


@router.post("/set-name", response_model=s.UserOut)
def set_name(payload: s.SetNameRequest, db: Session = Depends(get_db)):
    u = db.query(m.User).get(payload.user_id)
    if not u:
        raise HTTPException(404, "User not found")
    u.full_name = payload.full_name
    u.has_set_name = True
    db.commit()
    db.refresh(u)
    return u
