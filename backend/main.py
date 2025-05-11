from fastapi import FastAPI
from routes import users, sessions, focus, media, distraction, secrets

app=FastAPI()
for r in (users, sessions, focus, media, distraction, secrets):
    app.include_router(r.router)
