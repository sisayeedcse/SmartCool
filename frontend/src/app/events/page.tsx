"use client";

import React, { useState } from "react";
import { useSimulation, formatTimeStr } from "../../context/SimulationContext";
import { FileText, Filter, Clock, CheckCircle2 } from "lucide-react";

export default function EventsPage() {
  const { events, rooms } = useSimulation();
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredEvents = events.filter((e) => {
    const matchRoom = roomFilter === "all" || e.room === roomFilter;
    const matchType = typeFilter === "all" || e.ty === typeFilter;
    return matchRoom && matchType;
  });

  return (
    <main className="max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--tx)] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--ac)]" />
            System Event Log
          </h1>
          <p className="text-xs text-[var(--mu)] mt-1">
            Auditable log of occupancy transitions, automatic AC state switches, and manual overrides.
          </p>
        </div>

        {/* Filter bars */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-room" className="text-xs text-[var(--mu)] font-medium">
              Room:
            </label>
            <select
              id="filter-room"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="bg-[var(--pn)] border border-[var(--bd)] text-xs rounded-lg px-3 py-1.5 text-[var(--tx)] focus:outline-none focus:border-[var(--ac)]"
            >
              <option value="all">All rooms ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-type" className="text-xs text-[var(--mu)] font-medium">
              Event Type:
            </label>
            <select
              id="filter-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[var(--pn)] border border-[var(--bd)] text-xs rounded-lg px-3 py-1.5 text-[var(--tx)] focus:outline-none focus:border-[var(--ac)]"
            >
              <option value="all">All events</option>
              <option value="on">AC turned ON / motion</option>
              <option value="off">AC turned OFF / vacancy</option>
              <option value="info">Room empty / timers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <section className="smart-card overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-[var(--bd)] pb-2.5">
          <span className="text-xs font-semibold text-[var(--mu)] uppercase tracking-wider">
            Showing {filteredEvents.length} Recorded Events
          </span>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[var(--mu)]">
              <span className="w-2 h-2 rounded-full bg-[var(--ac)]" /> AC ON / Motion
            </span>
            <span className="flex items-center gap-1.5 text-[var(--mu)]">
              <span className="w-2 h-2 rounded-full bg-[var(--rd)]" /> AC OFF / Timeout
            </span>
            <span className="flex items-center gap-1.5 text-[var(--mu)]">
              <span className="w-2 h-2 rounded-full bg-[var(--am)]" /> Timer / Status
            </span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[var(--pn)] border-b border-[var(--bd)] z-10">
              <tr className="text-[var(--mu)] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-4 w-36">Time</th>
                <th className="py-2.5 px-4 w-48">Room</th>
                <th className="py-2.5 px-4">Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bd)] text-[var(--tx)]">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-[var(--mu)]">
                      {formatTimeStr(evt.t)}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[var(--tx)]">
                      {evt.room}
                    </td>
                    <td className="py-2.5 px-4 flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          evt.ty === "off"
                            ? "bg-[var(--rd)]"
                            : evt.ty === "info"
                            ? "bg-[var(--am)]"
                            : "bg-[var(--ac)]"
                        }`}
                      />
                      <span className="leading-relaxed">{evt.m}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-xs text-[var(--mu)]">
                    No events match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
