import psycopg2

url = "postgresql://postgres:nagaiaiai_010101@db.wphzfbfgsyqpzixgkltu.supabase.co:5432/postgres?sslmode=require"

try:
    conn = psycopg2.connect(url)
    print("✅ 연결 성공!")
    conn.close()
except Exception as e:
    print("❌ 연결 실패:", e)
