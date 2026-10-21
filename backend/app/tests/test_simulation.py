import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.simulator.engine import Config, generate_scenario
from app.energy.calculator import calculate_energy, compare_strategies

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

if __name__ == "__main__":
    test_energy_calculations()
    test_zero_baseline_handling()
    test_reproducibility()
    print("All basic tests passed.")
