# backend/routes/secrets.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..schemas import secret as s; from ..models import secret as m
from ..utils.crypto import encrypt; from ..database import get_db
router=APIRouter(prefix="/admin/secrets",tags=["admin-secrets"])

@router.post("/",response_model=s.SecretOut)
def store(b:s.SecretIn,db:Session=Depends(get_db)):
    enc=encrypt(b.plaintext_key)
    obj=db.query(m.SecretKey).filter_by(service=b.service,key_name=b.key_name).first()
    if obj: obj.key_value=enc
    else: obj=m.SecretKey(service=b.service,key_name=b.key_name,key_value=enc); db.add(obj)
    db.commit(); db.refresh(obj); return obj
