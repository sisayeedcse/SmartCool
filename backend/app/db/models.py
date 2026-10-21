"""Abstracted database layer supporting SQLite and future PostgreSQL."""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import func
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///smartcool.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class SimulationRun(Base):
    __tablename__ = "simulation_runs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    seed = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())
    config_json = Column(JSON)
    results_json = Column(JSON)


class ReadingRecord(Base):
    __tablename__ = "reading_records"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, index=True)
    timestamp = Column(DateTime)
    occupancy = Column(Boolean)
    occupancy_confidence = Column(Float)
    temperature_c = Column(Float)
    humidity_pct = Column(Float)
    ac_state = Column(String)
    ac_power_estimated_kw = Column(Float)
    sensor_health = Column(String)
    control_state = Column(String)
    event_reason = Column(String)


class EventRecord(Base):
    __tablename__ = "event_records"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, index=True)
    timestamp = Column(DateTime)
    event_type = Column(String)
    reason = Column(String)


def init_db():
    Base.metadata.create_all(bind=engine)
