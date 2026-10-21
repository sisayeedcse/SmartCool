"""Deterministic simulation engine."""
import random
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from .states import ControlState


@dataclass
class Config:
    seed: int = 42
    duration_minutes: int = 60
    resolution_minutes: int = 1
    vacancy_grace_minutes: int = 5
    setback_delay_minutes: int = 10
    shutdown_delay_minutes: int = 15
    comfort_setpoint_c: float = 24.0
    setback_setpoint_c: float = 28.0
    false_negative_rate: float = 0.05
    false_positive_rate: float = 0.05
    sensor_fault_prob: float = 0.02
    ac_power_kw: float = 2.5
    controller_power_kw: float = 0.02


@dataclass
class Reading:
    timestamp: datetime
    occupancy: bool
    occupancy_confidence: float
    temperature_c: float
    humidity_pct: float
    ac_state: str  # ON / SETBACK / OFF
    ac_power_estimated_kw: float
    sensor_health: str  # OK / FAULT / STALE
    control_state: ControlState
    event_reason: str


def generate_scenario(config: Config) -> List[Reading]:
    random.seed(config.seed)
    readings: List[Reading] = []
    base_time = datetime(2026, 1, 1, 9, 0, 0)
    occupancy_schedule = _generate_occupancy_schedule(config)
    current_state = ControlState.OCCUPIED
    vacancy_start: Optional[datetime] = None

    for i in range(config.duration_minutes // config.resolution_minutes):
        timestamp = base_time + timedelta(minutes=i * config.resolution_minutes)
        true_occupancy = occupancy_schedule.get(i, False)
        # Sensor error modeling
        detected_occupancy = true_occupancy
        confidence = 1.0
        sensor_health = "OK"
        if random.random() < config.sensor_fault_prob:
            sensor_health = "FAULT"
            detected_occupancy = False  # conservative on fault
            confidence = 0.0
        else:
            if not true_occupancy and random.random() < config.false_positive_rate:
                detected_occupancy = True
            if true_occupancy and random.random() < config.false_negative_rate:
                detected_occupancy = False
            if detected_occupancy != true_occupancy:
                confidence = 0.6
            else:
                confidence = 0.95

        # State machine
        previous_state = current_state
        event_reason = ""
        if sensor_health == "FAULT" and current_state != ControlState.SENSOR_FAULT:
            current_state = ControlState.SENSOR_FAULT
            event_reason = "Sensor fault detected; conservative fallback."
        elif current_state == ControlState.MANUAL_OVERRIDE:
            pass  # stays until cleared
        elif detected_occupancy:
            vacancy_start = None
            if current_state != ControlState.OCCUPIED:
                current_state = ControlState.OCCUPIED
                event_reason = "Reoccupation detected; restore comfort."
        else:
            if current_state == ControlState.OCCUPIED:
                vacancy_start = timestamp
                current_state = ControlState.VACANCY_PENDING
                event_reason = "Vacancy detected; grace period started."
            elif current_state == ControlState.VACANCY_PENDING:
                elapsed = (timestamp - vacancy_start).total_seconds() / 60.0 if vacancy_start else 0
                if elapsed >= config.vacancy_grace_minutes:
                    current_state = ControlState.VACANT_SETBACK
                    event_reason = f"Grace period exceeded ({config.vacancy_grace_minutes}m); setback."
            elif current_state == ControlState.VACANT_SETBACK:
                elapsed = (timestamp - vacancy_start).total_seconds() / 60.0 if vacancy_start else 0
                if elapsed >= config.vacancy_grace_minutes + config.setback_delay_minutes:
                    current_state = ControlState.VACANT_OFF
                    event_reason = f"Setback delay exceeded ({config.setback_delay_minutes}m); shutdown."
            elif current_state == ControlState.VACANT_OFF:
                pass  # stays off
            elif current_state == ControlState.SENSOR_FAULT:
                event_reason = "Sensor fault; maintaining conservative fallback."

        if previous_state != current_state and not event_reason:
            event_reason = f"Transition: {previous_state.value} -> {current_state.value}"

        # AC state mapping
        ac_state = "ON"
        ac_power = config.ac_power_kw
        if current_state == ControlState.VACANT_SETBACK:
            ac_state = "SETBACK"
            ac_power = config.ac_power_kw * 0.6
        elif current_state in (ControlState.VACANT_OFF, ControlState.SENSOR_FAULT):
            ac_state = "OFF"
            ac_power = 0.0
        elif current_state == ControlState.MANUAL_OVERRIDE:
            ac_state = "ON"
            ac_power = config.ac_power_kw

        temperature = 26.0 + 2.0 * (1 if ac_state == "ON" else 0.7 if ac_state == "SETBACK" else 0.2) + random.uniform(-0.5, 0.5)
        humidity = 60.0 + random.uniform(-5, 5)

        reading = Reading(
            timestamp=timestamp,
            occupancy=true_occupancy,
            occupancy_confidence=confidence,
            temperature_c=round(temperature, 1),
            humidity_pct=round(humidity, 1),
            ac_state=ac_state,
            ac_power_estimated_kw=round(ac_power, 2),
            sensor_health=sensor_health,
            control_state=current_state,
            event_reason=event_reason,
        )
        readings.append(reading)
    return readings


def _generate_occupancy_schedule(config: Config) -> Dict[int, bool]:
    schedule: Dict[int, bool] = {}
    # Simple synthetic pattern: occupied first 20 min, vacant next 15, occupied rest
    for i in range(config.duration_minutes // config.resolution_minutes):
        if i < 20:
            schedule[i] = True
        elif i < 35:
            schedule[i] = False
        else:
            schedule[i] = True
    return schedule
