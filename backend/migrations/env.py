# migrations/env.py
import models.secret                     # → SecretKey
import models.distraction               # → Distraction
import models.session                   # → Session, enums
import models.user                      # → User
from models.base import Base            # your DeclarativeBase
from dotenv import load_dotenv
from alembic import context
from sqlalchemy import engine_from_config, pool
from logging.config import fileConfig
import os
import sys
import startup_env # load FERNET_KEY and all secret keys from DB
sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")))

# Alembic Config
config = context.config
raw = os.environ["DATABASE_URL"]
print("[DEBUG] raw DATABASE_URL:", raw)

# Strip prefix if present
db_url = raw.split("=", 1)[1] if raw.startswith("DATABASE_URL=") else raw

if not db_url.startswith("postgresql://"):
    raise RuntimeError("Malformed DATABASE_URL")

config.set_main_option("sqlalchemy.url", db_url)

if not db_url:
    raise RuntimeError(
        "DATABASE_URL is not set or could not be loaded from .env")

config.set_main_option("sqlalchemy.url", db_url)

# ——— IMPORT YOUR MODELS SO THEY REGISTER WITH Base.metadata ———

# now Base.metadata has **all** of your tables
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
