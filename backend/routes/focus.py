from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
import models.focus as models
import schemas.focus as schemas

router = APIRouter(prefix="/focus", tags=["Focus Log"])

@router.post("/", response_model=schemas.FocusOut)
def create_focus_log(focus: schemas.FocusCreate, db: Session = Depends(get_db)):
    new_focus = models.Focus(
        date_time=focus.date_time,
        distractions=focus.distractions,
        focus_score=focus.focus_score
    )
    db.add(new_focus)
    db.commit()
    db.refresh(new_focus)
    return new_focus

@router.get("/", response_model=List[schemas.FocusOut])
def get_all_focus_logs(db: Session = Depends(get_db)):
    return db.query(models.Focus).all()
