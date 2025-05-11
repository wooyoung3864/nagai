from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import user as s
from ..models import user as m
from ..database import get_db

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
