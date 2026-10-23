"use client";

import React from "react";
import { useSimulation, formatNum } from "../../context/SimulationContext";
import { BarChart3, TrendingDown, DollarSign, Zap } from "lucide-react";

export default function AnalyticsPage() {
  const {
    rooms,
    settings,
    getRoomMetrics,
    totalSmartEnergyKwh,
    totalNormalEnergyKwh,
    totalSavedEnergyKwh,
    savingsPercent,
    totalSmartCostBdt,
    totalSavedCostBdt,
  } = useSimulation();

  // Find maximum normal energy across rooms for normalized bars
  const maxRoomEnergy = Math.max(...rooms.map((r) => r.en), 0.01);

  return (
    <main className="max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--tx)] flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[var(--ac)]" />
          Energy & Cost Analysis
        </h1>
        <p className="text-xs text-[var(--mu)] mt-1">
          Comparative electricity consumption and financial savings breakdown across all rooms.
        </p>
      </div>

      {/* Aggregate KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="smart-card space-y-1">
          <span className="text-xs text-[var(--mu)] font-medium">Smart AC energy</span>
          <b className="text-2xl font-bold text-[var(--ac)] block font-mono">
            {formatNum(totalSmartEnergyKwh)} kWh
          </b>
          <span className="text-[11px] text-[var(--mu)]">Actual simulation total</span>
        </div>

        <div className="smart-card space-y-1">
          <span className="text-xs text-[var(--mu)] font-medium">Normal AC energy</span>
          <b className="text-2xl font-bold text-[var(--bl)] block font-mono">
            {formatNum(totalNormalEnergyKwh)} kWh
          </b>
          <span className="text-[11px] text-[var(--mu)]">Always-on baseline</span>
        </div>

        <div className="smart-card space-y-1">
          <span className="text-xs text-[var(--mu)] font-medium">Smart AC cost</span>
          <b className="text-2xl font-bold text-[var(--tx)] block font-mono">
            ৳ {formatNum(totalSmartCostBdt)}
          </b>
          <span className="text-[11px] text-[var(--mu)]">at ৳{settings.tariff}/kWh</span>
        </div>

        <div className="smart-card space-y-1 border-[var(--ac)]/30">
          <span className="text-xs text-[var(--mu)] font-medium">Cost saved</span>
          <b className="text-2xl font-bold text-[var(--ac)] block font-mono">
            ৳ {formatNum(totalSavedCostBdt)}
          </b>
          <span className="text-[11px] text-[var(--ac)] font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            {formatNum(savingsPercent, 1)}% less expenditure
          </span>
        </div>
      </section>

      {/* Room-by-room Table */}
      <section className="smart-card overflow-hidden">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[var(--tx)]">Energy & Cost by Room</h2>
          <span className="text-xs text-[var(--mu)]">
            Individual room contribution to facility savings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--bd)] bg-[var(--bg)]/50 text-[var(--mu)] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-3">AC Units</th>
                <th className="py-3 px-3">Normal (kWh)</th>
                <th className="py-3 px-3">Smart (kWh)</th>
                <th className="py-3 px-3">Saved (kWh)</th>
                <th className="py-3 px-3">Saving %</th>
                <th className="py-3 px-3">Normal Cost (৳)</th>
                <th className="py-3 px-3">Smart Cost (৳)</th>
                <th className="py-3 px-4 text-right">Saved (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bd)] text-[var(--tx)]">
              {rooms.map((r) => {
                const m = getRoomMetrics(r);
                return (
                  <tr key={r.id} className="hover:bg-[var(--bg)]/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--tx)]">{r.name}</td>
                    <td className="py-3 px-3 font-mono">{r.acs.length}</td>
                    <td className="py-3 px-3 font-mono text-[var(--bl)]">{formatNum(r.en)}</td>
                    <td className="py-3 px-3 font-mono text-[var(--ac)]">{formatNum(r.e)}</td>
                    <td className="py-3 px-3 font-mono font-bold">{formatNum(m.sv)}</td>
                    <td className="py-3 px-3">
                      <span className="badge-ok font-mono">{formatNum(m.pct, 1)}%</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--mu)]">৳ {formatNum(m.cn)}</td>
                    <td className="py-3 px-3 font-mono">৳ {formatNum(m.cost)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[var(--ac)] text-right">
                      ৳ {formatNum(m.sv * settings.tariff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Comparative Progress Bars */}
      <section className="smart-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--tx)]">
            Smart vs Normal Energy per Room
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[var(--bl)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--bl)]" />
              <span>Normal AC</span>
            </span>
            <span className="flex items-center gap-1.5 text-[var(--ac)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--ac)]" />
              <span>Smart AC</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {rooms.map((r) => {
            const normalWidth = (r.en / maxRoomEnergy) * 100;
            const smartWidth = (r.e / maxRoomEnergy) * 100;

            return (
              <div
                key={r.id}
                className="grid grid-cols-[140px_1fr_130px] gap-3 items-center text-xs p-2 rounded-lg bg-[var(--bg)] border border-[var(--bd)]"
              >
                <span className="font-semibold text-[var(--tx)] truncate">{r.name}</span>

                <div className="space-y-1.5">
                  {/* Normal AC bar */}
                  <div className="w-full bg-[var(--pn)] h-2 rounded-full overflow-hidden border border-[var(--bd)]">
                    <div
                      className="h-full bg-[var(--bl)] rounded-full transition-all"
                      style={{ width: `${Math.min(100, normalWidth)}%` }}
                    />
                  </div>
                  {/* Smart AC bar */}
                  <div className="w-full bg-[var(--pn)] h-2 rounded-full overflow-hidden border border-[var(--bd)]">
                    <div
                      className="h-full bg-[var(--ac)] rounded-full transition-all"
                      style={{ width: `${Math.min(100, smartWidth)}%` }}
                    />
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-[var(--mu)]">
                  <span className="text-[var(--bl)] font-semibold">{formatNum(r.en, 1)}</span> /{" "}
                  <span className="text-[var(--ac)] font-semibold">{formatNum(r.e, 1)}</span> kWh
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
