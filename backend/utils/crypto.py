from cryptography.fernet import Fernet
import os, dotenv
dotenv.load_dotenv()

KEY = os.getenv("FERNET_MASTER_KEY") or Fernet.generate_key()
cipher = Fernet(KEY)

encrypt = lambda s: cipher.encrypt(s.encode()).decode()
decrypt = lambda t: cipher.decrypt(t.encode()).decode()
