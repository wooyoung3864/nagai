# create_tables.py
from database import Base, engine
from models import user, distraction, focus  # 필요한 모델 모두 import

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ Done.")
