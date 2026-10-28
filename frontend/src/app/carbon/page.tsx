"use client";

import React from "react";
import { useSimulation, calculateRoomMetrics, formatNum } from "../../context/SimulationContext";
import { Leaf, ShieldCheck, Globe, Info } from "lucide-react";

export default function CarbonPage() {
  const {
    rooms,
    settings,
    totals,
  } = useSimulation();

  return (
    <main className="max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--tx)] flex items-center gap-2">
          <Leaf className="w-6 h-6 text-[var(--ac)]" />
          Carbon Impact & Sustainability
        </h1>
        <p className="text-xs text-[var(--mu)] mt-1">
          Greenhouse gas emissions reduction tracking based on dynamic grid emission factor.
        </p>
      </div>

      {/* Honesty & Transparency Notice */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--pn)] border border-[var(--bd)] text-xs text-[var(--mu)]">
        <Info className="w-4 h-4 text-[var(--ac)] shrink-0" />
        <span>
          <strong className="text-[var(--tx)]">Simulation Prototype:</strong> Simulated estimates based on assumed AC power, tariff (৳{settings.tariff}/kWh) and emission factor ({settings.ef} kg CO₂e/kWh). Not measured savings.
        </span>
      </div>

      {/* Aggregate KPIs (Single Source of Truth from totals) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="smart-card space-y-1 p-3 sm:p-4">
          <span className="text-[11px] sm:text-xs text-[var(--mu)] font-medium">Normal AC emissions</span>
          <b className="text-xl sm:text-2xl font-bold text-[var(--bl)] block font-mono">
            {formatNum(totals.totalNormalCo2Kg, 2)} kg CO₂e
          </b>
          <span className="text-[10px] sm:text-[11px] text-[var(--mu)]">Always-on baseline</span>
        </div>

        <div className="smart-card space-y-1 p-3 sm:p-4">
          <span className="text-[11px] sm:text-xs text-[var(--mu)] font-medium">Smart AC emissions</span>
          <b className="text-xl sm:text-2xl font-bold text-[var(--tx)] block font-mono">
            {formatNum(totals.totalSmartCo2Kg, 2)} kg CO₂e
          </b>
          <span className="text-[10px] sm:text-[11px] text-[var(--mu)]">With vacancy confirmation</span>
        </div>

        <div className="smart-card space-y-1 p-3 sm:p-4 border-[var(--ac)]/40 bg-[var(--ac)]/5">
          <span className="text-[11px] sm:text-xs text-[var(--ac)] font-bold">Emissions avoided</span>
          <b className="text-xl sm:text-2xl font-bold text-[var(--ac)] block font-mono">
            {formatNum(totals.totalSavedCo2Kg, 2)} kg CO₂e
          </b>
          <span className="text-[10px] sm:text-[11px] text-[var(--ac)] font-semibold">
            {formatNum(totals.savingsPercent, 1)}% reduction
          </span>
          <span className="block text-[9px] sm:text-[10px] text-[var(--mu)] mt-0.5 truncate">
            Simulated estimate, not measured
          </span>
        </div>

        <div className="smart-card space-y-1 p-3 sm:p-4">
          <span className="text-[11px] sm:text-xs text-[var(--mu)] font-medium">Emission factor</span>
          <b className="text-xl sm:text-2xl font-bold text-[var(--tx)] block font-mono">
            {settings.ef} kg/kWh
          </b>
          <span className="text-[11px] text-[var(--mu)]">Configurable in Settings</span>
        </div>
      </section>

      {/* Room Breakdown Table */}
      <section className="smart-card overflow-hidden">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[var(--tx)]">Carbon Impact by Room</h2>
          <span className="text-xs text-[var(--mu)]">
            Avoided CO₂-equivalent emissions breakdown by space (rows sum exactly to totals)
          </span>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full min-w-[500px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--bd)] bg-[var(--bg)]/50 text-[var(--mu)] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-3">Normal (kg CO₂e)</th>
                <th className="py-3 px-3">Smart (kg CO₂e)</th>
                <th className="py-3 px-3">Avoided (kg CO₂e)</th>
                <th className="py-3 px-4 text-right">Reduction %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bd)] text-[var(--tx)]">
              {rooms.map((r) => {
                const rm = calculateRoomMetrics(r, settings.tariff, settings.ef);
                return (
                  <tr key={r.id} className="hover:bg-[var(--bg)]/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--tx)]">{r.name}</td>
                    <td className="py-3 px-3 font-mono text-[var(--bl)]">{formatNum(rm.normalCo2, 2)}</td>
                    <td className="py-3 px-3 font-mono">{formatNum(rm.smartCo2, 2)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[var(--ac)]">
                      {formatNum(rm.savedCo2, 2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="badge-ok font-mono">{formatNum(rm.savingsPercent, 1)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--bd)] bg-[var(--bg)]/70 font-semibold text-[var(--tx)]">
                <td className="py-3 px-4">Total Facility</td>
                <td className="py-3 px-3 font-mono text-[var(--bl)]">{formatNum(totals.totalNormalCo2Kg, 2)}</td>
                <td className="py-3 px-3 font-mono">{formatNum(totals.totalSmartCo2Kg, 2)}</td>
                <td className="py-3 px-3 font-mono font-bold text-[var(--ac)]">
                  {formatNum(totals.totalSavedCo2Kg, 2)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="badge-ok font-mono">{formatNum(totals.savingsPercent, 1)}%</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Environmental Context Card */}
      <section className="p-4 rounded-xl bg-[var(--pn)] border border-[var(--bd)] space-y-2 text-xs text-[var(--mu)]">
        <div className="flex items-center gap-2 text-[var(--tx)] font-semibold">
          <Globe className="w-4 h-4 text-[var(--ac)]" />
          <span>Scientific Carbon Accounting Method</span>
        </div>
        <p>
          Avoided carbon footprint is calculated using the formula:{" "}
          <code className="text-[var(--ac)] font-mono">Avoided CO₂e (kg) = (Baseline kWh − SmartCool kWh) × Emission Factor</code>.
          The default emission factor of <b>0.696 kg CO₂e/kWh</b> represents an assumed regional electricity grid intensity. Values are simulated estimates, not verified carbon credits.
        </p>
      </section>
    </main>
  );
}
