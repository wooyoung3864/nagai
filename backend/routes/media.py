# backend/routes/media.py
from fastapi import APIRouter, UploadFile, HTTPException
from datetime import datetime, timedelta
import mimetypes, secrets
from ..supabase_client import sb
router=APIRouter(prefix="/media",tags=["media"])
BUCKET="snapshots"

@router.post("/upload")
async def upload(file:UploadFile):
    data=await file.read()
    if not data: raise HTTPException(400,"empty")
    folder=f"u{secrets.token_hex(4)}"
    name=f"{int(datetime.utcnow().timestamp()*1000)}{file.filename[-5:]}"
    path=f"{folder}/{name}"
    mime=mimetypes.guess_type(name)[0] or "image/webp"
    res=sb.storage.from_(BUCKET).upload(path,data,{"content-type":mime,"cacheControl":"604800"})
    if res.get("error"): raise HTTPException(500,res["error"]["message"])
    url=sb.storage.from_(BUCKET).get_public_url(path)
    exp=int((datetime.utcnow()+timedelta(days=7)).timestamp())
    return {"snapshot_url":url,"storage_path":path,"expires_at":exp}
