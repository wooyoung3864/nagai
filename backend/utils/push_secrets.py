# scripts/push_secrets.py
import copy
import requests

BASE = "http://localhost:8000/admin/secrets/"
secrets = [
    {"service": "postgres", "key_name": "database_url", "plaintext_key": "DATABASE_URL=postgresql://postgres.wphzfbfgsyqpzixgkltu:nagaiaiai_010101@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require"},
    {"service": "supabase", "key_name": "url", "plaintext_key": "https://wphzfbfgsyqpzixgkltu.supabase.co/"},
    {"service": "supabase", "key_name": "anon_key", "plaintext_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaHpmYmZnc3lxcHppeGdrbHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjIwOTQsImV4cCI6MjA2MTU5ODA5NH0.fnz0wju8X95U56pknwL81k2uwsF4Vpja7nuRqEerOJA"},
    {"service": "supabase", "key_name": "service_role_key", "plaintext_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaHpmYmZnc3lxcHppeGdrbHR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAyMjA5NCwiZXhwIjoyMDYxNTk4MDk0fQ.BSwSl6SItLy-e9QITdhUsk3ggj5YR6D-6EBh_LEgsQA"},
    {"service": "supabase", "key_name": "jwt_secret", "plaintext_key": "BCBqt6+5BNRJad1fbdRetFDPt3HjpKVfmnkBf4UFHkfi1DQV02TFBTfAlzKeawImJVqI4l1/SfOC1J8l3b217w=="},
    {"service": "supabase", "key_name": "token", "plaintext_key": "eyJhbGciOiJIUzI1NiIsImtpZCI6ImtIUlJkenE3cCtHNHNDaHIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3dwaHpmYmZnc3lxcHppeGdrbHR1LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxZGRlM2RiYS1jZTkwLTQ2ODYtYWMxNy0zOWM4YWVhNDkyZDAiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQ3NTMyNDQ1LCJpYXQiOjE3NDczNTYwNDUsImVtYWlsIjoid29veW91bmczODY0QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZ29vZ2xlIiwicHJvdmlkZXJzIjpbImdvb2dsZSJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmxOeEgybUN3YkFaeDAwdlMwcjRwcFhTLTdsNV83V3ctSVA5dEdvNnlOZWxXemNqcz1zOTYtYyIsImVtYWlsIjoid29veW91bmczODY0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJXb295b3VuZyBKdW5nIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6Ildvb3lvdW5nIEp1bmciLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKbE54SDJtQ3diQVp4MDB2UzByNHBwWFMtN2w1XzdXdy1JUDl0R282eU5lbFd6Y2pzPXM5Ni1jIiwicHJvdmlkZXJfaWQiOiIxMTIzNTE2MTIyODg2NzExMTE0MzYiLCJzdWIiOiIxMTIzNTE2MTIyODg2NzExMTE0MzYifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc0NzM1NjA0NX1dLCJzZXNzaW9uX2lkIjoiZTNkZTQ4MjctYzYwYS00OGZhLWE3MTQtMzAwZDdmNjU2NTIzIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.M0oYteZQUQuLp6e3EN2wBWXccZ6NRI_-l6EAWtHenHs"},
    {"service": "jwt", "key_name": "secret", "plaintext_key": "LgNLlNduwEZJjYHYquaMV59n0wbVOTgO9LNsIpR5id3HyYVz0Ls4z3jDd2s8M8b6W0k2M1M4_8gzRbCPY8doHw"},
    {"service": "google", "key_name": "client_id", "plaintext_key": "101034724311-6jj0pbgu2cimrsat2q6b7puqf6p19h84.apps.googleusercontent.com"},
    {"service": "google", "key_name": "client_secret", "plaintext_key": "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"},
    {"service": "fernet", "key_name": "secret", "plaintext_key": "GqKBSmmyseW5Z0nY0xWkHxiLgQ-rpFCfyhShhpZDR7g="},
    {"service": "gemini", "key_name": "api_key_1", "plaintext_key": "AIzaSyCZ9yNobnF2wJap7f9LEvPVr2dCFTb5aCo"},
    {"service": "gemini", "key_name": "api_key_2", "plaintext_key": "AIzaSyAl9TIvPzX4OC7Uixl08cb-UDnQ-kGTSHw"},
    {"service": "gemini", "key_name": "api_key_3", "plaintext_key": "AIzaSyA5E2RqP-utLkqvdmjogAnG1g2VHAPyT40"},
    {"service": "gemini", "key_name": "api_key_4", "plaintext_key": "AIzaSyBLc2ZJKUppbyajxfJ3A5hwbDBBcJhoxzs"},
    {"service": "gemini", "key_name": "api_key_5", "plaintext_key": "AIzaSyD1xUKLO25hTABaSxvd5r0jKebQ6PQ9MTo"},
    {"service": "gemini", "key_name": "api_key_6", "plaintext_key": "AIzaSyB3gTytoOHRP8nNPwtdOUTMgHHiqEG22DE"},
]

for s in secrets:
    body = copy.deepcopy(s)  # FIX HERE
    res = requests.post(BASE, json=body)
    print(f"Pushed {s['key_name']} → {res.status_code}")
