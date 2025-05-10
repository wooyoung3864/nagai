import psycopg2
import os

url = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(url)
    print("✅ 연결 성공!")
    conn.close()
except Exception as e:
    print("❌ 연결 실패:", e)
