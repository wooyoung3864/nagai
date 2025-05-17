# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres.wphzfbfgsyqpzixgkltu:nagaiaiai_010101@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require" # os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("[FATAL] DATABASE_URL is not set")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
