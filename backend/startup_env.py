# backend/startup_env.py
import os
from dotenv import load_dotenv

# 1. Load .env (FERNET_SECRET)
load_dotenv()

# 2. Run secret loader AFTER FERNET is present
from utils.init_env import load_secrets_to_env
load_secrets_to_env()
