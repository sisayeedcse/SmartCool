"use client";

import React from "react";
import { useSimulation, formatNum } from "../../context/SimulationContext";
import { Scale, CheckCircle2, XCircle, ArrowRight, ShieldAlert, Info } from "lucide-react";

export default function ComparePage() {
  const {
    totals,
    settings,
  } = useSimulation();

  return (
    <main className="max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--tx)] flex items-center gap-2">
          <Scale className="w-6 h-6 text-[var(--ac)]" />
          Baseline vs. SmartCool Comparison
        </h1>
        <p className="text-xs text-[var(--mu)] mt-1">
          Fair, apple-to-apple comparison under identical thermal loads, schedules, and weather profiles.
        </p>
      </div>

      {/* Fairness & Transparency banner */}
      <section className="p-3.5 rounded-xl bg-[var(--pn)] border border-[var(--bd)] text-xs text-[var(--mu)] space-y-2">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <b className="font-semibold text-amber-300 block mb-0.5">Fair Comparison Guarantee</b>
            <span>
              Both strategies share identical simulated occupancy intervals, thermal parameters, and room specifications. The only variable is SmartCool&apos;s automated vacancy control.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--bd)] text-[11px]">
          <Info className="w-3.5 h-3.5 text-[var(--ac)] shrink-0" />
          <span>
            Simulated estimates based on assumed AC power (0.8–1.4 kW), tariff (৳{settings.tariff}/kWh) and emission factor ({settings.ef} kg CO₂e/kWh). Not measured savings.
          </span>
        </div>
      </section>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conventional Baseline */}
        <section className="smart-card space-y-4 border-[var(--bl)]/30">
          <div className="flex items-center justify-between border-b border-[var(--bd)] pb-2.5">
            <div>
              <h2 className="text-sm font-bold text-[var(--bl)]">Conventional Control (Baseline)</h2>
              <span className="text-[11px] text-[var(--mu)]">Always ON during work hours (9:00 AM – 3:00 PM)</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-[var(--bl)]/15 text-[var(--bl)] font-semibold">
              Status Quo
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <MetricRow label="Cumulative Electricity" val={`${formatNum(totals.totalNormalEnergyKwh, 2)} kWh`} />
            <MetricRow label="Electricity Cost" val={`৳ ${formatNum(totals.totalNormalCostBdt, 2)}`} />
            <MetricRow label="CO₂e Footprint" val={`${formatNum(totals.totalNormalCo2Kg, 2)} kg`} />
            <MetricRow label="Vacancy Detection" val="Disabled (manual shutoff only)" />
            <MetricRow label="Average Compressor Load" val="100% of workday" />
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] text-xs text-[var(--mu)] space-y-1">
            <span className="font-semibold text-[var(--tx)] block">Characteristics:</span>
            <p>• Cools empty classrooms during breaks, schedule gaps, and lunch.</p>
            <p>• Common operational failure: AC units left running when rooms are empty.</p>
          </div>
        </section>

        {/* SmartCool System */}
        <section className="smart-card space-y-4 border-[var(--ac)]/40 bg-[var(--ac)]/5">
          <div className="flex items-center justify-between border-b border-[var(--bd)] pb-2.5">
            <div>
              <h2 className="text-sm font-bold text-[var(--ac)]">SmartCool Intelligent System</h2>
              <span className="text-[11px] text-[var(--mu)]">Occupancy-aware vacancy confirmation</span>
            </div>
            <span className="badge-ok font-semibold">
              -{formatNum(totals.savingsPercent, 1)}% Energy (Simulated)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <MetricRow label="Cumulative Electricity" val={`${formatNum(totals.totalSmartEnergyKwh, 2)} kWh`} highlightGreen />
            <MetricRow label="Electricity Cost" val={`৳ ${formatNum(totals.totalSmartCostBdt, 2)}`} highlightGreen />
            <MetricRow label="CO₂e Footprint" val={`${formatNum(totals.totalSmartCo2Kg, 2)} kg`} highlightGreen />
            <MetricRow label="Vacancy Timeout" val={`${settings.vac} minutes confirmation`} />
            <MetricRow label="Thermal Comfort" val={`Target ${settings.set} °C`} />
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] text-xs text-[var(--mu)] space-y-1">
            <span className="font-semibold text-[var(--ac)] block">Benefits:</span>
            <p>• Instant cooling reactivation upon human movement detection.</p>
            <p>• Saves ৳ {formatNum(totals.totalSavedCostBdt, 2)} and avoids {formatNum(totals.totalSavedCo2Kg, 2)} kg CO₂e in simulation today.</p>
          </div>
        </section>
      </div>

      {/* Summary table */}
      <section className="smart-card overflow-hidden">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[var(--tx)]">Summary Differential Table</h2>
          <span className="text-xs text-[var(--mu)]">Total facility-wide comparison (consistent with Dashboard & Energy & Cost)</span>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full min-w-[550px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--bd)] bg-[var(--bg)]/50 text-[var(--mu)] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-4">Performance Metric</th>
                <th className="py-2.5 px-4">Conventional Baseline</th>
                <th className="py-2.5 px-4">SmartCool System</th>
                <th className="py-2.5 px-4 text-right">Net Savings (Simulated)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bd)] text-[var(--tx)]">
              <tr>
                <td className="py-3 px-4 font-semibold">Total Electricity Consumed</td>
                <td className="py-3 px-4 font-mono text-[var(--bl)]">{formatNum(totals.totalNormalEnergyKwh, 2)} kWh</td>
                <td className="py-3 px-4 font-mono text-[var(--ac)]">{formatNum(totals.totalSmartEnergyKwh, 2)} kWh</td>
                <td className="py-3 px-4 font-mono font-bold text-[var(--ac)] text-right">
                  {formatNum(totals.totalSavedEnergyKwh, 2)} kWh ({formatNum(totals.savingsPercent, 1)}%)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Utility Bill Impact</td>
                <td className="py-3 px-4 font-mono">৳ {formatNum(totals.totalNormalCostBdt, 2)}</td>
                <td className="py-3 px-4 font-mono">৳ {formatNum(totals.totalSmartCostBdt, 2)}</td>
                <td className="py-3 px-4 font-mono font-bold text-[var(--ac)] text-right">
                  ৳ {formatNum(totals.totalSavedCostBdt, 2)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Carbon Footprint</td>
                <td className="py-3 px-4 font-mono">{formatNum(totals.totalNormalCo2Kg, 2)} kg CO₂e</td>
                <td className="py-3 px-4 font-mono">{formatNum(totals.totalSmartCo2Kg, 2)} kg CO₂e</td>
                <td className="py-3 px-4 font-mono font-bold text-[var(--ac)] text-right">
                  {formatNum(totals.totalSavedCo2Kg, 2)} kg CO₂e
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function MetricRow({ label, val, highlightGreen }: { label: string; val: string; highlightGreen?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-[var(--bd)]/40 last:border-0">
      <span className="text-[var(--mu)]">{label}</span>
      <span className={`font-mono font-semibold ${highlightGreen ? "text-[var(--ac)]" : "text-[var(--tx)]"}`}>
        {val}
      </span>
    </div>
  );
}
