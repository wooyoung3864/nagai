from fastapi import FastAPI
from routes import users, sessions, focus, media, distraction, secrets, auth

app = FastAPI()

for router in (users, sessions, focus, media, distraction, secrets, auth):
    app.include_router(router.router)
    