"use client";

import React, { useState } from "react";
import {
  useSimulation,
  SCHEDULE_NAMES,
  SCHEDULES,
} from "../../context/SimulationContext";
import {
  Settings2,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";

export default function SettingsPage() {
  const {
    settings,
    updateSetting,
    restartDay,
    rooms,
    addRoom,
    removeRoom,
  } = useSimulation();

  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomAcs, setNewRoomAcs] = useState(2);
  const [newRoomSchedule, setNewRoomSchedule] = useState("A");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    const name = newRoomName.trim();
    if (!name) {
      setAddError("Please enter a room name.");
      return;
    }
    if (rooms.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      setAddError("A room with this name already exists.");
      return;
    }
    if (newRoomAcs < 1 || newRoomAcs > 6) {
      setAddError("Number of AC units must be between 1 and 6.");
      return;
    }

    const ok = addRoom(name, newRoomAcs, newRoomSchedule);
    if (ok) {
      setAddSuccess(`Room "${name}" added successfully!`);
      setNewRoomName("");
      setNewRoomAcs(2);
      setTimeout(() => setAddSuccess(""), 4000);
    } else {
      setAddError("Failed to add room.");
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--tx)] flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-[var(--ac)]" />
          Simulation Parameters & Room Management
        </h1>
        <p className="text-xs text-[var(--mu)] mt-1">
          Adjust thermal physics parameters, utility tariffs, carbon emission coefficients, and manage facility spaces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulation Parameters (span 6) */}
        <section className="smart-card lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--bd)] pb-2.5">
            <h2 className="text-sm font-bold text-[var(--tx)]">Simulation Parameters</h2>
            <span className="text-xs text-[var(--ac)] font-medium">Real-time reactive</span>
          </div>

          <div className="space-y-3.5">
            <SettingInput
              label="Electricity Tariff (৳ per kWh)"
              value={settings.tariff}
              min={1}
              max={50}
              step={0.5}
              unit="৳"
              desc="Retail electricity cost per kilowatt-hour"
              onChange={(val) => updateSetting("tariff", val)}
            />

            <SettingInput
              label="Grid Emission Factor (kg CO₂e per kWh)"
              value={settings.ef}
              min={0.1}
              max={2.0}
              step={0.001}
              unit="kg/kWh"
              desc="Carbon emissions intensity coefficient"
              onChange={(val) => updateSetting("ef", val)}
            />

            <SettingInput
              label="Vacancy Timeout (Minutes)"
              value={settings.vac}
              min={1}
              max={30}
              step={1}
              unit="min"
              desc="Elapsed empty time before automatic AC shutdown in auto mode"
              onChange={(val) => updateSetting("vac", val)}
            />

            <SettingInput
              label="Comfort Temperature Setpoint (°C)"
              value={settings.set}
              min={20}
              max={30}
              step={0.5}
              unit="°C"
              desc="Thermostat cooling target for occupied spaces"
              onChange={(val) => updateSetting("set", val)}
            />

            <SettingInput
              label="Simulation Speed (ms per simulated minute)"
              value={settings.ms}
              min={200}
              max={4000}
              step={100}
              unit="ms"
              desc="Clock interval between simulated minutes (lower = faster)"
              onChange={(val) => updateSetting("ms", val)}
            />
          </div>

          <div className="pt-4 border-t border-[var(--bd)] space-y-2.5">
            <p className="text-[11px] text-[var(--mu)] leading-relaxed">
              Parameter changes apply continuously to simulated minutes. You can restart the 9:00 AM – 3:00 PM simulation day at any time to clear metrics and rerun.
            </p>
            <button
              onClick={restartDay}
              className="smart-btn text-xs py-2 px-3.5 hover:border-[var(--rd)] hover:text-[var(--rd)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart simulated day (9:00 AM)</span>
            </button>
          </div>
        </section>

        {/* Right Column: Room Management (span 6) */}
        <section className="smart-card lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--bd)] pb-2.5">
            <h2 className="text-sm font-bold text-[var(--tx)]">Room Management</h2>
            <span className="text-xs text-[var(--mu)]">{rooms.length} active spaces</span>
          </div>

          {/* Current Rooms Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--bd)] text-[var(--mu)] uppercase tracking-wider font-semibold">
                  <th className="py-2 px-2">Room</th>
                  <th className="py-2 px-2">ACs</th>
                  <th className="py-2 px-2">Class Schedule</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--bd)] text-[var(--tx)]">
                {rooms.map((r, i) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-2 font-semibold text-[var(--tx)]">{r.name}</td>
                    <td className="py-2.5 px-2 font-mono">{r.acs.length}</td>
                    <td className="py-2.5 px-2 text-[var(--mu)]">
                      {SCHEDULE_NAMES[r.sk] || r.sk}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => removeRoom(i)}
                        disabled={rooms.length <= 1}
                        className="p-1 rounded text-[var(--mu)] hover:text-[var(--rd)] disabled:opacity-30 disabled:hover:text-[var(--mu)]"
                        title={rooms.length <= 1 ? "At least one room must remain" : "Remove room"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Room Form */}
          <div className="pt-4 border-t border-[var(--bd)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--tx)]">
              Add New Room
            </h3>

            <form onSubmit={handleAddRoom} className="space-y-3">
              <div>
                <label htmlFor="new-room-name" className="block text-xs text-[var(--mu)] mb-1">
                  Room Name
                </label>
                <input
                  id="new-room-name"
                  type="text"
                  placeholder="e.g. Lab 202 or Conference Room 401"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--bd)] rounded-lg px-3 py-2 text-xs text-[var(--tx)] focus:outline-none focus:border-[var(--ac)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-room-acs" className="block text-xs text-[var(--mu)] mb-1">
                    AC Units (1–6)
                  </label>
                  <input
                    id="new-room-acs"
                    type="number"
                    min={1}
                    max={6}
                    value={newRoomAcs}
                    onChange={(e) => setNewRoomAcs(parseInt(e.target.value) || 1)}
                    className="w-full bg-[var(--bg)] border border-[var(--bd)] rounded-lg px-3 py-2 text-xs text-[var(--tx)] focus:outline-none focus:border-[var(--ac)]"
                  />
                </div>

                <div>
                  <label htmlFor="new-room-sched" className="block text-xs text-[var(--mu)] mb-1">
                    Class Schedule
                  </label>
                  <select
                    id="new-room-sched"
                    value={newRoomSchedule}
                    onChange={(e) => setNewRoomSchedule(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--bd)] rounded-lg px-3 py-2 text-xs text-[var(--tx)] focus:outline-none focus:border-[var(--ac)]"
                  >
                    {Object.keys(SCHEDULE_NAMES).map((k) => (
                      <option key={k} value={k}>
                        {SCHEDULE_NAMES[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {addError && (
                <div className="p-2 rounded bg-red-900/20 border border-red-800/40 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {addSuccess && (
                <div className="p-2 rounded bg-emerald-900/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{addSuccess}</span>
                </div>
              )}

              <button type="submit" className="smart-btn smart-btn-primary text-xs py-2 px-4 w-full justify-center">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room to Facility</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function SettingInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  desc,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  desc: string;
  onChange: (val: number) => void;
}) {
  return (
    <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1.5">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1">
        <label className="text-xs font-semibold text-[var(--tx)]">{label}</label>
        <span className="text-xs font-mono font-bold text-[var(--ac)] shrink-0">
          {value} {unit}
        </span>
      </div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) onChange(val);
        }}
        className="w-full bg-[var(--pn)] border border-[var(--bd)] rounded-md px-3 py-1.5 text-xs text-[var(--tx)] font-mono focus:outline-none focus:border-[var(--ac)]"
      />
      <p className="text-[10px] text-[var(--mu)]">{desc}</p>
    </div>
  );
}
