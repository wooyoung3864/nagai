# backend/auth/supabase_client.py
from supabase import create_client
from config import SUPABASE_ANON_KEY

SUPABASE_URL = "https://wphzfbfgsyqpzixgkltu.supabase.co/"

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Missing Supabase credentials in environment variables")

sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
