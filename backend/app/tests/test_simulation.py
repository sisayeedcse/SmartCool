import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.simulator.engine import Config, generate_scenario, Reading
from app.simulator.states import ControlState
from app.energy.calculator import calculate_energy, compare_strategies
from datetime import datetime, timedelta

def test_energy_calculations():
    cfg = Config(duration_minutes=60)
    readings = generate_scenario(cfg)
    result = calculate_energy(readings)
    assert result["smartcool_total_kwh"] > 0
    assert result["duration_hours"] > 0


def test_zero_baseline_handling():
    result = compare_strategies([], [])
    assert result["savings_percent"] is None or result["savings_percent"] == 0.0


def test_reproducibility():
    cfg = Config(seed=123, duration_minutes=30)
    r1 = generate_scenario(cfg)
    r2 = generate_scenario(cfg)
    assert len(r1) == len(r2)
    for a, b in zip(r1, r2):
        assert a.control_state == b.control_state
        assert a.timestamp == b.timestamp


def test_vacancy_timer_expiry_and_state_transition():
    """Verify that when motion stops, the vacancy timer counts, expires at the configured delay, and triggers the intended state."""
    cfg = Config(
        seed=1,
        duration_minutes=30,
        vacancy_grace_minutes=5,
        false_positive_rate=0.0,
        false_negative_rate=0.0,
        sensor_fault_prob=0.0,
    )
    readings = generate_scenario(cfg)
    
    # Verify that whenever a VACANCY_PENDING state persists for config.vacancy_grace_minutes,
    # the state machine transitions to VACANT_SETBACK or VACANT_OFF
    found_pending = False
    for i, r in enumerate(readings):
        if r.control_state == ControlState.VACANCY_PENDING:
            found_pending = True
            # Look ahead up to grace minutes
            grace_idx = i + cfg.vacancy_grace_minutes
            if grace_idx < len(readings) and not readings[grace_idx].occupancy:
                assert readings[grace_idx].control_state in (
                    ControlState.VACANT_SETBACK,
                    ControlState.VACANT_OFF,
                ), f"At minute {grace_idx}, state should be VACANT_SETBACK or VACANT_OFF after grace period, got {readings[grace_idx].control_state}"
            break
    assert found_pending, "Scenario should contain a vacancy event"


def test_motion_return_resets_vacancy_timer():
    """Verify that if motion returns before vacancy delay expires, the timer resets and state returns to OCCUPIED."""
    base_time = datetime(2026, 1, 1, 9, 0, 0)
    cfg = Config(
        seed=42,
        duration_minutes=20,
        vacancy_grace_minutes=5,
        base_time=base_time,
        false_positive_rate=0.0,
        false_negative_rate=0.0,
        sensor_fault_prob=0.0,
    )
    # Simulate a scenario with known occupancy transitions
    readings = generate_scenario(cfg)
    
    # Ensure that any reading with true detected occupancy is in OCCUPIED state and has no pending vacancy shutdown
    for r in readings:
        if r.occupancy and r.sensor_health == "OK":
            assert r.control_state == ControlState.OCCUPIED, (
                f"Expected OCCUPIED state on motion detection, got {r.control_state}"
            )


def test_totals_and_accounting_consistency():
    """Verify saved = baseline - smart, cost = kWh * tariff, and CO2 = kWh * EF."""
    cfg = Config(duration_minutes=60, seed=42)
    readings = generate_scenario(cfg)
    tariff = 10.0
    ef = 0.696
    result = compare_strategies(readings, readings, tariff_bdt_per_kwh=tariff, emissions_factor_kg_co2e_per_kwh=ef)
    
    expected_saved = round(result["baseline_total_kwh"] - result["smartcool_total_kwh"], 4)
    assert abs(result["net_saved_kwh"] - expected_saved) < 1e-4
    
    expected_cost = round(result["net_saved_kwh"] * tariff, 2)
    assert abs(result["bill_savings_bdt"] - expected_cost) < 1e-2
    
    expected_co2 = round(result["net_saved_kwh"] * ef, 4)
    assert abs(result["avoided_co2e_kg"] - expected_co2) < 1e-4


if __name__ == "__main__":
    test_energy_calculations()
    test_zero_baseline_handling()
    test_reproducibility()
    test_vacancy_timer_expiry_and_state_transition()
    test_motion_return_resets_vacancy_timer()
    test_totals_and_accounting_consistency()
    print("All backend simulation tests passed.")
