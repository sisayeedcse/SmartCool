"use client";

import React from "react";
import { useSimulation, calculateRoomMetrics, formatNum } from "../../context/SimulationContext";
import { BarChart3, TrendingDown, DollarSign, Zap, Info } from "lucide-react";

export default function AnalyticsPage() {
  const {
    rooms,
    settings,
    totals,
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

      {/* Honesty & Simulation Transparency Note */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--pn)] border border-[var(--bd)] text-xs text-[var(--mu)]">
        <Info className="w-4 h-4 text-[var(--ac)] shrink-0" />
        <span>
          <strong className="text-[var(--tx)]">Simulation Prototype:</strong> Simulated estimates based on assumed AC power, tariff (৳{settings.tariff}/kWh) and emission factor ({settings.ef} kg CO₂e/kWh). Not measured savings.
        </span>
      </div>

      {/* Aggregate KPIs (Single Source of Truth from totals) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="smart-card space-y-1">
          <span className="text-xs text-[var(--mu)] font-medium">Smart AC energy</span>
          <b className="text-2xl font-bold text-[var(--ac)] block font-mono">
            {formatNum(totals.totalSmartEnergyKwh, 2)} kWh
          </b>
          <span className="text-[11px] text-[var(--mu)]">Simulated total</span>
        </div>

        <div className="smart-card space-y-1">
          <span className="text-xs text-[var(--mu)] font-medium">Normal AC energy</span>
          <b className="text-2xl font-bold text-[var(--bl)] block font-mono">
            {formatNum(totals.totalNormalEnergyKwh, 2)} kWh
          </b>
          <span className="text-[11px] text-[var(--mu)]">
            Always-on baseline (all ACs continuously ON)
          </span>
        </div>

        <div className="smart-card space-y-1">
          <span className="text-xs text-[var(--mu)] font-medium">Smart AC cost</span>
          <b className="text-2xl font-bold text-[var(--tx)] block font-mono">
            ৳ {formatNum(totals.totalSmartCostBdt, 2)}
          </b>
          <span className="text-[11px] text-[var(--mu)]">at ৳{settings.tariff}/kWh</span>
        </div>

        <div className="smart-card space-y-1 border-[var(--ac)]/30 bg-[var(--ac)]/5">
          <span className="text-xs text-[var(--mu)] font-medium">Cost saved</span>
          <b className="text-2xl font-bold text-[var(--ac)] block font-mono">
            ৳ {formatNum(totals.totalSavedCostBdt, 2)}
          </b>
          <span className="text-[11px] text-[var(--ac)] font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            {formatNum(totals.savingsPercent, 1)}% simulated reduction
          </span>
          <span className="block text-[10px] text-[var(--mu)] mt-0.5">
            Simulated estimate, not measured
          </span>
        </div>
      </section>

      {/* Room-by-room Table */}
      <section className="smart-card overflow-hidden">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[var(--tx)]">Energy & Cost by Room</h2>
          <span className="text-xs text-[var(--mu)]">
            Individual room contribution to facility savings (rows sum exactly to totals above)
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
                const rm = calculateRoomMetrics(r, settings.tariff, settings.ef);
                return (
                  <tr key={r.id} className="hover:bg-[var(--bg)]/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--tx)]">{r.name}</td>
                    <td className="py-3 px-3 font-mono">{r.acs.length}</td>
                    <td className="py-3 px-3 font-mono text-[var(--bl)]">{formatNum(rm.normalKwh, 2)}</td>
                    <td className="py-3 px-3 font-mono text-[var(--ac)]">{formatNum(rm.smartKwh, 2)}</td>
                    <td className="py-3 px-3 font-mono font-bold">{formatNum(rm.savedKwh, 2)}</td>
                    <td className="py-3 px-3">
                      <span className="badge-ok font-mono">{formatNum(rm.savingsPercent, 1)}%</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[var(--mu)]">৳ {formatNum(rm.normalCost, 2)}</td>
                    <td className="py-3 px-3 font-mono">৳ {formatNum(rm.smartCost, 2)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[var(--ac)] text-right">
                      ৳ {formatNum(rm.savedCost, 2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--bd)] bg-[var(--bg)]/70 font-semibold text-[var(--tx)]">
                <td className="py-3 px-4">Total Facility</td>
                <td className="py-3 px-3 font-mono">{totals.totalAcs}</td>
                <td className="py-3 px-3 font-mono text-[var(--bl)]">{formatNum(totals.totalNormalEnergyKwh, 2)}</td>
                <td className="py-3 px-3 font-mono text-[var(--ac)]">{formatNum(totals.totalSmartEnergyKwh, 2)}</td>
                <td className="py-3 px-3 font-mono font-bold">{formatNum(totals.totalSavedEnergyKwh, 2)}</td>
                <td className="py-3 px-3">
                  <span className="badge-ok font-mono">{formatNum(totals.savingsPercent, 1)}%</span>
                </td>
                <td className="py-3 px-3 font-mono text-[var(--mu)]">৳ {formatNum(totals.totalNormalCostBdt, 2)}</td>
                <td className="py-3 px-3 font-mono">৳ {formatNum(totals.totalSmartCostBdt, 2)}</td>
                <td className="py-3 px-4 font-mono font-bold text-[var(--ac)] text-right">
                  ৳ {formatNum(totals.totalSavedCostBdt, 2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Comparative Progress Bars */}
      <section className="smart-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--tx)]">
              Smart vs Normal Energy per Room
            </h2>
            <span className="text-xs text-[var(--mu)]">
              Baseline assumes all AC units continuously powered without occupancy control
            </span>
          </div>
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
            const rm = calculateRoomMetrics(r, settings.tariff, settings.ef);
            const normalWidth = (rm.normalKwh / maxRoomEnergy) * 100;
            const smartWidth = (rm.smartKwh / maxRoomEnergy) * 100;

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
                  <span className="text-[var(--bl)] font-semibold">{formatNum(rm.normalKwh, 2)}</span> /{" "}
                  <span className="text-[var(--ac)] font-semibold">{formatNum(rm.smartKwh, 2)}</span> kWh
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
