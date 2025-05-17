# backend/config.py
import os

# Fail early in production
REQUIRED_VARS = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
    "GOOGLE_CLIENT_ID",
    "JWT_SECRET",
    "SUPABASE_JWT_SECRET",
]

for var in REQUIRED_VARS:
    if not os.getenv(var):
        raise RuntimeError(f"[FATAL] Missing required environment variable: {var}")

# Export verified environment variables
SUPABASE_URL            = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY       = os.environ["SUPABASE_ANON_KEY"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
DATABASE_URL            = os.environ["DATABASE_URL"]

GOOGLE_CLIENT_ID        = os.environ["GOOGLE_CLIENT_ID"]
JWT_SECRET              = os.environ["JWT_SECRET"]
SUPABASE_JWT_SECRET     = os.environ["SUPABASE_JWT_SECRET"]
JWT_ALGORITHM           = "HS256"
JWT_EXPIRES_IN          = 60 * 60 * 24 * 7  # one week

FERNET_SECRET           = os.environ["FERNET_SECRET"]
