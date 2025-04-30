# === routes/user.py ===
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models.user as models
import schemas.user as schemas
from database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/me", response_model=schemas.UserOut)
async def read_users_me(db: Session = Depends(get_db)):
    user = db.query(models.User).first()
    return user