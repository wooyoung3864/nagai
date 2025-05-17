# utils/crypto.py
import os
from cryptography.fernet import Fernet

def get_fernet():
    key = os.getenv("FERNET_SECRET")
    if not key:
        raise RuntimeError("FERNET_SECRET is not set in the environment.")
    return Fernet(key)

def encrypt(plaintext: str) -> str:
    return get_fernet().encrypt(plaintext.encode()).decode()

def decrypt(ciphertext: str) -> str:
    return get_fernet().decrypt(ciphertext.encode()).decode()
