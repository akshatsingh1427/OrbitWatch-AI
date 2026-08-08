import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# Base directory
BASE_DIR = Path(__file__).resolve().parent


# Allow Render to provide a persistent data directory.
# Locally, continue using backend/data.
DATA_DIR = Path(
    os.getenv(
        "DATA_DIR",
        str(BASE_DIR / "data")
    )
)

DATA_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{DATA_DIR / 'satellite.db'}"
)


# SQLite configuration
connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }


engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()