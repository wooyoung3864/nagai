# backend/routes/secrets.py
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from schemas import secret as s
from models import secret as m
from utils.crypto import encrypt, decrypt
from database import get_db


router = APIRouter(prefix="/admin/secrets", tags=["admin-secrets"])


@router.post("/", response_model=s.SecretOut)
def store(b: s.SecretIn, db: Session = Depends(get_db)):
    enc = encrypt(b.plaintext_key)
    obj = db.query(m.SecretKey).filter_by(
        service=b.service, key_name=b.key_name).first()
    if obj:
        obj.key_value = enc
    else:
        obj = m.SecretKey(service=b.service,
                          key_name=b.key_name, key_value=enc)
        db.add(obj)
    db.commit()
    db.refresh(obj)
    print(
        f"[INFO] Stored secret for service={b.service}, key_name={b.key_name}")
    return obj


@router.post("/retrieve", response_model=str)
def retrieve_secret(query: s.SecretQuery, db: Session = Depends(get_db)):
    obj = db.query(m.SecretKey).filter_by(
        service=query.service, key_name=query.key_name).first()
    print(obj)
    if not obj:
        raise HTTPException(404, detail="Secret not found")
    return decrypt(obj.key_value)


@router.options("/frontend-env", include_in_schema=False)
def options_frontend_env():
    return


@router.post("/frontend-env", response_model=dict)
def frontend_env(keys: list[str] = Body(...), db: Session = Depends(get_db)):
    result = {}
    for key in keys:
        service, key_name = key.split(".", 1)
        obj = db.query(m.SecretKey).filter_by(
            service=service, key_name=key_name).first()
        if obj:
            result[key.upper().replace(".", "_")] = decrypt(obj.key_value)
    return result
