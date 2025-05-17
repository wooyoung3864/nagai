# backend/config.py
import os
import pathlib
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Export environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL") or ""
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or ""
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""
DATABASE_URL = os.getenv("DATABASE_URL") or ""

GOOGLE_CLIENT_ID  = os.getenv("GOOGLE_CLIENT_ID")
JWT_SECRET        = os.getenv("JWT_SECRET")  # a random 32+ character string
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
JWT_ALGORITHM     = "HS256"
JWT_EXPIRES_IN    = 60 * 60 * 24 * 7  # one week

if not (SUPABASE_URL and SUPABASE_ANON_KEY and DATABASE_URL and GOOGLE_CLIENT_ID and JWT_SECRET and SUPABASE_JWT_SECRET):
    raise RuntimeError("Missing JWT_SECRET, SUPABASE, or Google OAuth creds")
