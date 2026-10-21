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
