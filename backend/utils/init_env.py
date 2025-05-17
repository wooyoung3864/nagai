# backend/utils/init_env.py
import os
from sqlalchemy.orm import Session
from models.secret import SecretKey
from utils.crypto import decrypt
from database import SessionLocal
from dotenv import load_dotenv

# load FERNET_SECRET from local dev .env file first
load_dotenv()

FERNET_SECRET = os.getenv("FERNET_SECRET")

def load_secrets_to_env():
    db: Session = SessionLocal()
    for s in db.query(SecretKey).all():
        env_key = f"{s.service.upper()}_{s.key_name.upper()}"
        try:
            decrypted = decrypt(s.key_value)
            print(f"[DEBUG] {env_key}: {decrypted[:8]}... OK")
            os.environ[env_key] = decrypted
            print(os.environ[env_key])
        except Exception as e:
            print(f"[ERROR] {env_key}: {type(e).__name__} → {e}")
            print(f"[RAW] key_value = {s.key_value}")
    db.close()
    
load_secrets_to_env()
