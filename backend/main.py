# === main.py ===
from fastapi import FastAPI
from auth.oauth import router as auth_router
from routes.user import router as user_router
from routes.distraction import router as distraction_router
from routes.focus import router as focus_router

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(distraction_router, prefix="/distraction", tags=["Distraction"])
app.include_router(focus_router, prefix="/focus", tags=["Focus"])