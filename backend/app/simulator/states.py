"""Simulation states."""
from enum import Enum


class ControlState(str, Enum):
    OCCUPIED = "OCCUPIED"
    VACANCY_PENDING = "VACANCY_PENDING"
    VACANT_SETBACK = "VACANT_SETBACK"
    VACANT_OFF = "VACANT_OFF"
    SENSOR_FAULT = "SENSOR_FAULT"
    MANUAL_OVERRIDE = "MANUAL_OVERRIDE"
