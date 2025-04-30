# === routes/distraction.py ===
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models.distraction as models
import schemas.distraction as schemas
from database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/log", response_model=schemas.DistractionOut)
async def create_distraction(distraction: schemas.DistractionCreate, db: Session = Depends(get_db)):
    db_distraction = models.Distraction(**distraction.dict(), user_id=1)
    db.add(db_distraction)
    db.commit()
    db.refresh(db_distraction)
    return db_distraction

@router.get("/history", response_model=list[schemas.DistractionOut])
async def get_distractions(db: Session = Depends(get_db)):
    return db.query(models.Distraction).all()