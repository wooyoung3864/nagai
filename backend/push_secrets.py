# push_secrets.py (예시)
from models.secret import Secret
from database import SessionLocal
from utils.crypto import encrypt_key

def push_gemini_secrets():
    db = SessionLocal()
    secrets = [
        {"service": "gemini", "key_name": "api_key_1", "plaintext_key": "AIzaSyCZ9yNobnF2wJap7f9LEvPVr2dCFTb5aCo"},
        {"service": "gemini", "key_name": "api_key_2", "plaintext_key": "AIzaSyAl9TIvPzX4OC7Uixl08cb-UDnQ-kGTSHw"},
        {"service": "gemini", "key_name": "api_key_3", "plaintext_key": "AIzaSyA5E2RqP-utLkqvdmjogAnG1g2VHAPyT40"},
    ]

    for s in secrets:
        encrypted_key = encrypt_key(s["plaintext_key"])
        db.add(Secret(service=s["service"], key_name=s["key_name"], encrypted_key=encrypted_key))

    db.commit()
    db.close()

if __name__ == "__main__":
    push_gemini_secrets()
