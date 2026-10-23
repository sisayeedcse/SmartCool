"use client";

import React, { useState } from "react";
import { useSimulation, formatNum } from "../../context/SimulationContext";
import { Waves, Power, Sliders, CheckCircle2, AlertCircle } from "lucide-react";

export default function MonitoringPage() {
  const { rooms, toggleAcPower, toggleAcMode, settings } = useSimulation();
  const [filterRoom, setFilterRoom] = useState<string>("all");

  const filteredRooms =
    filterRoom === "all"
      ? rooms
      : rooms.filter((r) => r.name === filterRoom);

  return (
    <main className="max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--tx)] flex items-center gap-2">
            <Waves className="w-6 h-6 text-[var(--ac)]" />
            Live Data – All Rooms & AC Units
          </h1>
          <p className="text-xs text-[var(--mu)] mt-1">
            Real-time status, thermal readings, vacancy timers, and individual unit switches.
          </p>
        </div>

        {/* Room Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="room-filter" className="text-xs text-[var(--mu)] font-medium">
            Filter Room:
          </label>
          <select
            id="room-filter"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="bg-[var(--pn)] border border-[var(--bd)] text-xs rounded-lg px-3 py-1.5 text-[var(--tx)] focus:outline-none focus:border-[var(--ac)]"
          >
            <option value="all">All Rooms ({rooms.length})</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Main Table Card */}
      <section className="smart-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--bd)] bg-[var(--bg)]/50 text-[var(--mu)] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-3">AC Unit</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3">Power Draw</th>
                <th className="py-3 px-3">Room Temp</th>
                <th className="py-3 px-3">Occupancy</th>
                <th className="py-3 px-3">Vacancy Timer</th>
                <th className="py-3 px-4 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bd)] text-[var(--tx)]">
              {filteredRooms.map((r, roomIndex) => {
                const originalRoomIdx = rooms.findIndex((orig) => orig.id === r.id);

                return r.acs.map((ac, acIdx) => (
                  <tr
                    key={`${r.id}-${ac.n}`}
                    className="hover:bg-[var(--bg)]/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-[var(--tx)]">
                      {r.name}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">{ac.n}</td>
                    <td className="py-3 px-3">
                      <span className={ac.on ? "badge-ok" : "badge-off"}>
                        {ac.on ? "ON" : "OFF"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`capitalize font-medium ${
                          ac.mode === "auto" ? "text-[var(--ac)]" : "text-[var(--am)]"
                        }`}
                      >
                        {ac.mode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {formatNum(ac.p, 2)} kW
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {formatNum(r.temp, 1)} °C
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium ${
                          r.occ ? "text-[var(--ac)]" : "text-[var(--mu)]"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            r.occ ? "bg-[var(--ac)] animate-pulse" : "bg-[var(--mu)]"
                          }`}
                        />
                        {r.occ ? "Occupied" : "Vacant"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--mu)]">
                      {String(r.vac).padStart(2, "0")}:00 / {String(settings.vac).padStart(2, "0")}:00
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => toggleAcPower(originalRoomIdx, acIdx)}
                          className={`smart-btn text-[11px] py-1 px-2.5 ${
                            ac.on
                              ? "hover:border-[var(--rd)] hover:text-[var(--rd)]"
                              : "smart-btn-primary"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>Turn {ac.on ? "off" : "on"}</span>
                        </button>
                        <button
                          onClick={() => toggleAcMode(originalRoomIdx, acIdx)}
                          className="smart-btn text-[11px] py-1 px-2.5"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Set {ac.mode === "auto" ? "manual" : "auto"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notice info */}
      <section className="p-4 rounded-xl bg-amber-900/20 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">Live Simulation Note</p>
          <p>
            Data is driven by the internal thermodynamic simulation engine in real-time. Manual controls override automatic schedules until reset or set back to Auto mode.
          </p>
        </div>
      </section>
    </main>
  );
}
