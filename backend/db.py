from contextlib import contextmanager
from typing import Iterator
 
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
 
from config import get_settings
 
 
Base = declarative_base()
 
 
def _get_engine():
    settings = get_settings()
    url = f"sqlite:///{settings.sqlite_db_path}"
    # check_same_thread=False allows usage across threads (e.g. FastAPI workers)
    return create_engine(url, connect_args={"check_same_thread": False})
 
 
engine = _get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
 
 
@contextmanager
def get_session() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
 
