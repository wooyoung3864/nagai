# backend/auth/supabase_client.py
from supabase import create_client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Missing Supabase credentials in environment variables")

sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
