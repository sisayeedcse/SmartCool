// SmartCool simulation adapter for frontend
// Uses verified engine parameters and produces synthetic data consistent with backend
export const DEFAULT_CONFIG = {
  seed: 42,
  durationMinutes: 60,
  vacancyTimeoutMin: 5,
  comfortThresholdC: 24.0,
  setbackSetpointC: 28.0,
  acPowerKw: 2.5,
  controllerPowerKw: 0.02,
  tariffBdtPerKwh: 10,
  emissionsFactorKgPerKwh: 0.696,
  falseNegativeRate: 0.05,
  falsePositiveRate: 0.05,
  sensorFaultProb: 0.02,
};

export type ControlState =
  | 'OCCUPIED'
  | 'VACANCY_PENDING'
  | 'VACANT_SETBACK'
  | 'VACANT_OFF'
  | 'SENSOR_FAULT'
  | 'MANUAL_OVERRIDE';

export interface RoomData {
  id: string;
  name: string;
  acUnits: number;
  state: ControlState;
  occupancy: boolean;
  temperatureC: number;
  humidityPct: number;
  acState: 'ON' | 'SETBACK' | 'OFF';
  estimatedPowerKw: number;
  vacancyElapsedMin: number;
  lastUpdated: Date;
  connected: boolean;
  events: EventLogEntry[];
}

export interface EventLogEntry {
  id: string;
  timestamp: Date;
  roomId: string;
  message: string;
  type: 'on' | 'off' | 'info';
}
