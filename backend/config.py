# backend/config.py
import os
import pathlib
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Export environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
