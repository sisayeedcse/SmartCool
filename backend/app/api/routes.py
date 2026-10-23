from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ..simulator.engine import generate_scenario, Config
from ..energy.calculator import calculate_energy, compare_strategies
from ..db import models
from ..db.models import init_db, SessionLocal, SimulationRun, ReadingRecord, EventRecord
from typing import Optional
import json
from datetime import datetime

app = FastAPI(title="SmartCool API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "smartcool"}


@app.post("/api/simulations")
def create_simulation(data: dict):
    # Minimal creation endpoint
    db = SessionLocal()
    run = SimulationRun(
        name=data.get("name", "Untitled"),
        seed=data.get("seed", 42),
        config_json=data,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    db.close()
    return {"id": run.id, "name": run.name, "seed": run.seed}


@app.get("/api/simulations")
def list_simulations():
    db = SessionLocal()
    rows = db.query(SimulationRun).order_by(SimulationRun.created_at.desc()).all()
    db.close()
    return [{"id": r.id, "name": r.name, "seed": r.seed, "created_at": r.created_at} for r in rows]


@app.get("/api/simulations/{sim_id}")
def get_simulation(sim_id: int):
    db = SessionLocal()
    r = db.query(SimulationRun).filter(SimulationRun.id == sim_id).first()
    db.close()
    if not r:
        return {"error": "Not found"}
    return {"id": r.id, "name": r.name, "seed": r.seed, "config_json": r.config_json}


@app.post("/api/simulations/{sim_id}/start")
def start_simulation(sim_id: int):
    db = SessionLocal()
    r = db.query(SimulationRun).filter(SimulationRun.id == sim_id).first()
    if not r:
        db.close()
        return {"error": "Not found"}
    cfg_dict = r.config_json or {}
    cfg = Config(**cfg_dict)
    readings = generate_scenario(cfg)
    for rd in readings:
        db.add(ReadingRecord(
            run_id=sim_id,
            timestamp=rd.timestamp,
            occupancy=rd.occupancy,
            occupancy_confidence=rd.occupancy_confidence,
            temperature_c=rd.temperature_c,
            humidity_pct=rd.humidity_pct,
            ac_state=rd.ac_state,
            ac_power_estimated_kw=rd.ac_power_estimated_kw,
            sensor_health=rd.sensor_health,
            control_state=rd.control_state.value,
            event_reason=rd.event_reason,
        ))
    # Generate baseline for comparison
    results = compare_strategies(readings, readings)
    r.results_json = results
    db.commit()
    db.close()
    return {"id": sim_id, "status": "completed", "results": results}


@app.get("/api/simulations/{sim_id}/readings")
def get_readings(sim_id: int):
    db = SessionLocal()
    rows = db.query(ReadingRecord).filter(ReadingRecord.run_id == sim_id).order_by(ReadingRecord.timestamp).all()
    db.close()
    return [
        {
            "timestamp": r.timestamp,
            "occupancy": r.occupancy,
            "occupancy_confidence": r.occupancy_confidence,
            "temperature_c": r.temperature_c,
            "humidity_pct": r.humidity_pct,
            "ac_state": r.ac_state,
            "ac_power_estimated_kw": r.ac_power_estimated_kw,
            "sensor_health": r.sensor_health,
            "control_state": r.control_state,
            "event_reason": r.event_reason,
        }
        for r in rows
    ]


@app.get("/api/simulations/{sim_id}/results")
def get_results(sim_id: int):
    db = SessionLocal()
    r = db.query(SimulationRun).filter(SimulationRun.id == sim_id).first()
    db.close()
    if not r:
        return {"error": "Not found"}
    return r.results_json or {}


@app.get("/api/simulations/{sim_id}/export.csv")
def export_csv(sim_id: int):
    db = SessionLocal()
    rows = db.query(ReadingRecord).filter(ReadingRecord.run_id == sim_id).order_by(ReadingRecord.timestamp).all()
    db.close()
    import csv, io
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "timestamp", "occupancy", "occupancy_confidence", "temperature_c",
        "humidity_pct", "ac_state", "ac_power_estimated_kw", "sensor_health",
        "control_state", "event_reason",
    ])
    for r in rows:
        writer.writerow([
            r.timestamp, r.occupancy, r.occupancy_confidence, r.temperature_c,
            r.humidity_pct, r.ac_state, r.ac_power_estimated_kw, r.sensor_health,
            r.control_state, r.event_reason,
        ])
    output.seek(0)
    return {"csv_content": output.getvalue()}


@app.post("/api/simulations/{sim_id}/reset")
def reset_simulation(sim_id: int, admin_token: Optional[str] = None):
    # Simple admin token check: must match document token
    expected = "demo-admin-token"
    if admin_token != expected:
        return {"error": "Unauthorized"}
    db = SessionLocal()
    # Clear readings and events for this run
    db.query(ReadingRecord).filter(ReadingRecord.run_id == sim_id).delete(synchronize_session=False)
    db.query(EventRecord).filter(EventRecord.run_id == sim_id).delete(synchronize_session=False)
    r = db.query(SimulationRun).filter(SimulationRun.id == sim_id).first()
    if r:
        r.results_json = None
    db.commit()
    db.close()
    return {"id": sim_id, "status": "reset"}


@app.get("/api/rooms/defaults")
def get_default_rooms():
    return {
        "rooms": [
            {"id": "rm-101", "name": "Room 101", "ac_count": 2, "schedule_key": "A", "schedule_name": "4 lectures"},
            {"id": "rm-102", "name": "Room 102", "ac_count": 1, "schedule_key": "B", "schedule_name": "3 lectures (no 10:00)"},
            {"id": "rm-201", "name": "Computer Lab 201", "ac_count": 3, "schedule_key": "C", "schedule_name": "3 lectures (no 9:00)"},
            {"id": "rm-301", "name": "Seminar Hall 301", "ac_count": 2, "schedule_key": "D", "schedule_name": "3 lectures (no 11:00)"},
        ],
        "schedules": {
            "A": {"name": "4 lectures", "intervals": [[540, 585], [600, 645], [660, 705], [735, 780]]},
            "B": {"name": "3 lectures (no 10:00)", "intervals": [[540, 585], [660, 705], [735, 780]]},
            "C": {"name": "3 lectures (no 9:00)", "intervals": [[600, 645], [660, 705], [735, 780]]},
            "D": {"name": "3 lectures (no 11:00)", "intervals": [[540, 585], [600, 645], [735, 780]]},
        }
    }


@app.get("/api/settings/defaults")
def get_default_settings():
    return {
        "tariff_bdt_per_kwh": 10.0,
        "emissions_factor_kg_per_kwh": 0.696,
        "vacancy_timeout_min": 5,
        "temperature_setpoint_c": 24.0,
        "simulation_speed_ms": 1500,
        "start_minute": 540,  # 9:00 AM
        "end_minute": 900,    # 3:00 PM
    }

