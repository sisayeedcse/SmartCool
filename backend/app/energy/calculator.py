"""Energy calculations with documented assumptions."""
from typing import List, Optional
from datetime import datetime, timedelta
from ..simulator.engine import Reading, Config


def calculate_energy(readings: List[Reading], controller_kw: float = 0.02) -> dict:
    total_ac_kwh = 0.0
    total_controller_kwh = 0.0
    duration_hours = len(readings) * 1 / 60.0  # default 1-min resolution assumption
    # More robust: compute from reading timestamps
    if len(readings) >= 2:
        duration_hours = (readings[-1].timestamp - readings[0].timestamp).total_seconds() / 3600.0
    else:
        duration_hours = len(readings) / 60.0

    for r in readings:
        # Assume 1-minute intervals for simplicity; use duration if available
        interval_hours = 1.0 / 60.0
        total_ac_kwh += r.ac_power_estimated_kw * interval_hours
        total_controller_kwh += controller_kw * interval_hours

    smartcool_kwh = total_ac_kwh + total_controller_kwh
    return {
        "smartcool_ac_kwh": round(total_ac_kwh, 4),
        "smartcool_controller_kwh": round(total_controller_kwh, 4),
        "smartcool_total_kwh": round(smartcool_kwh, 4),
        "duration_hours": round(duration_hours, 2),
    }


def compare_strategies(readings_smartcool: List[Reading], readings_baseline: List[Reading], tariff_bdt_per_kwh: float = 8.5, emissions_factor_kg_co2e_per_kwh: Optional[float] = None) -> dict:
    sc = calculate_energy(readings_smartcool)
    # Baseline uses full AC ON for same duration
    baseline_readings = [
        Reading(
            timestamp=r.timestamp,
            occupancy=r.occupancy,
            occupancy_confidence=r.occupancy_confidence,
            temperature_c=r.temperature_c,
            humidity_pct=r.humidity_pct,
            ac_state="ON",
            ac_power_estimated_kw=2.5,
            sensor_health=r.sensor_health,
            control_state=r.control_state,
            event_reason="Baseline: always ON",
        )
        for r in readings_baseline
    ]
    bl = calculate_energy(baseline_readings)
    net_saved = bl["smartcool_total_kwh"] - sc["smartcool_total_kwh"]
    savings_percent = (net_saved / bl["smartcool_total_kwh"] * 100) if bl["smartcool_total_kwh"] > 0 else None
    bill_savings_bdt = net_saved * tariff_bdt_per_kwh
    avoided_co2e = None
    if emissions_factor_kg_co2e_per_kwh is not None:
        avoided_co2e = net_saved * emissions_factor_kg_co2e_per_kwh

    return {
        "baseline_total_kwh": bl["smartcool_total_kwh"],
        "smartcool_total_kwh": sc["smartcool_total_kwh"],
        "net_saved_kwh": round(net_saved, 4),
        "savings_percent": round(savings_percent, 2) if savings_percent is not None else None,
        "bill_savings_bdt": round(bill_savings_bdt, 2),
        "tariff_bdt_per_kwh": tariff_bdt_per_kwh,
        "emissions_factor_kg_co2e_per_kwh": emissions_factor_kg_co2e_per_kwh,
        "avoided_co2e_kg": round(avoided_co2e, 4) if avoided_co2e is not None else None,
    }
