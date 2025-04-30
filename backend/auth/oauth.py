# === auth/oauth.py ===
from fastapi import APIRouter

router = APIRouter()

@router.get("/login")
async def login():
    return {"message": "OAuth login here"}