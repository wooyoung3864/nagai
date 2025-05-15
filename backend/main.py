from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users, sessions, focus, media, distraction, secrets, auth

app = FastAPI()

# allow your frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for quick dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (users, sessions, focus, media, distraction, secrets, auth):
    app.include_router(router.router)
    