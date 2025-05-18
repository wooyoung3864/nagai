import startup_env  # ⬅️ this sets os.environ correctly

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users, sessions, focus, media, distraction, secrets, auth
from utils.init_env import load_secrets_to_env

app = FastAPI()

# allow your frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "https://your-vercel-app.vercel.app", # ⬅️ when deployed],  # TODO: add link to Vercel-hosted production frontend
                    ],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (users, sessions, focus, media, distraction, secrets, auth):
    app.include_router(router.router)
    
load_secrets_to_env()

import os
print("[DEBUG] Effective FERNET_SECRET:", os.getenv("FERNET_SECRET"))
