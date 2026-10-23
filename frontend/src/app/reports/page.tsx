"use client";

import React from "react";
import { useSimulation, formatNum, formatTimeStr } from "../../context/SimulationContext";
import { Download, FileText, CheckCircle2, Table } from "lucide-react";

export default function ReportsPage() {
  const { rooms, events, settings, t } = useSimulation();

  // Export Time-Series CSV
  const handleExportTimeSeries = () => {
    let csv = "Timestamp,Room,SmartTemp_C,NormalTemp_C,SmartEnergy_kWh,NormalEnergy_kWh,Occupied\n";
    rooms.forEach((r) => {
      r.h.forEach((pt) => {
        csv += `${formatTimeStr(pt.t)},"${r.name}",${pt.a},${pt.b},${pt.e},${pt.en},${r.occ}\n`;
      });
    });

    downloadCsv(csv, `smartcool-timeseries-${Date.now()}.csv`);
  };

  // Export Summary CSV
  const handleExportSummary = () => {
    let csv = "Room,AC_Units,Schedule,Normal_kWh,Smart_kWh,Saved_kWh,Savings_Pct,Normal_Cost_BDT,Smart_Cost_BDT,Saved_Cost_BDT\n";
    rooms.forEach((r) => {
      const sv = r.en - r.e;
      const pct = r.en > 0 ? (100 * sv) / r.en : 0;
      const cn = r.en * settings.tariff;
      const cost = r.e * settings.tariff;
      const savedBdt = sv * settings.tariff;
      csv += `"${r.name}",${r.acs.length},"${r.sk}",${formatNum(r.en)},${formatNum(r.e)},${formatNum(sv)},${formatNum(pct, 1)}%,${formatNum(cn)},${formatNum(cost)},${formatNum(savedBdt)}\n`;
    });

    downloadCsv(csv, `smartcool-summary-${Date.now()}.csv`);
  };

  // Export Events CSV
  const handleExportEvents = () => {
    let csv = "Timestamp,Room,Event_Type,Description\n";
    events.forEach((e) => {
      csv += `${formatTimeStr(e.t)},"${e.room}","${e.ty}","${e.m.replace(/"/g, '""')}"\n`;
    });

    downloadCsv(csv, `smartcool-events-${Date.now()}.csv`);
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--tx)] flex items-center gap-2">
          <Download className="w-6 h-6 text-[var(--ac)]" />
          Reports & Data Exports
        </h1>
        <p className="text-xs text-[var(--mu)] mt-1">
          Export simulation traces, energy ledgers, and state machine audit trails in standardized formats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time-Series Export Card */}
        <section className="smart-card space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--ac)]/15 border border-[var(--ac)]/30 flex items-center justify-center text-[var(--ac)]">
              <Table className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[var(--tx)]">Time-Series Minute Traces</h2>
            <p className="text-xs text-[var(--mu)]">
              Detailed chronological records of temperature readings, cumulative energy, and compressor states for every simulated minute.
            </p>
          </div>

          <button
            onClick={handleExportTimeSeries}
            className="smart-btn smart-btn-primary text-xs py-2 px-3 w-full justify-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Time-Series (CSV)</span>
          </button>
        </section>

        {/* Room Summary Export Card */}
        <section className="smart-card space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--bl)]/15 border border-[var(--bl)]/30 flex items-center justify-center text-[var(--bl)]">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[var(--tx)]">Facility Financial Summary</h2>
            <p className="text-xs text-[var(--mu)]">
              Aggregated room-by-room electricity consumption, tariffs in BDT, avoided emissions, and percentage savings.
            </p>
          </div>

          <button
            onClick={handleExportSummary}
            className="smart-btn smart-btn-primary text-xs py-2 px-3 w-full justify-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Summary (CSV)</span>
          </button>
        </section>

        {/* Event Log Export Card */}
        <section className="smart-card space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--am)]/15 border border-[var(--am)]/30 flex items-center justify-center text-[var(--am)]">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-[var(--tx)]">State Transition Event Log</h2>
            <p className="text-xs text-[var(--mu)]">
              Audit trail of every motion event, vacancy timer trigger, and automatic compressor shutoff event ({events.length} entries).
            </p>
          </div>

          <button
            onClick={handleExportEvents}
            className="smart-btn smart-btn-primary text-xs py-2 px-3 w-full justify-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Events (CSV)</span>
          </button>
        </section>
      </div>

      {/* Configuration Metadata Block */}
      <section className="smart-card space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--tx)]">
          Exported Metadata & Assumptions
        </h3>
        <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] font-mono text-[11px] text-[var(--mu)] space-y-1">
          <div>// SmartCool Environment Configuration</div>
          <div>tariff_bdt_per_kwh = {settings.tariff};</div>
          <div>emissions_factor_kg_per_kwh = {settings.ef};</div>
          <div>vacancy_timeout_minutes = {settings.vac};</div>
          <div>temperature_setpoint_c = {settings.set};</div>
          <div>active_rooms_count = {rooms.length};</div>
          <div>simulated_time_clock = &quot;{formatTimeStr(t)}&quot;;</div>
        </div>
      </section>
    </main>
  );
}
