# create_tables.py
from models.base import Base
import models.user, models.oauth, models.session
import models.focus, models.distraction, models.secret
from database import engine

print("Creating tables …")
Base.metadata.create_all(bind=engine)
print("✅ Done.")

