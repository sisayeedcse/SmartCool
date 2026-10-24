"use client";

import React from "react";
import { BookOpen, CheckCircle2, ShieldAlert, Cpu, Flame, Leaf, Info } from "lucide-react";

export default function MethodologyPage() {
  return (
    <main className="max-w-[1000px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--tx)] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[var(--ac)]" />
          Engineering Methodology & Scientific Model
        </h1>
        <p className="text-xs text-[var(--mu)] mt-1">
          Detailed mathematical formulation, thermodynamic assumptions, engineering models, and disclosures.
        </p>
      </div>

      {/* Prominent Honesty Banner */}
      <div className="p-3.5 rounded-lg bg-[var(--pn)] border border-[var(--bd)] text-xs text-[var(--mu)] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[var(--ac)] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--tx)] block mb-0.5">Simulation Prototype Disclosure</strong>
          <span>
            SmartCool is a research-grade simulation prototype. All dashboard readings, energy calculations, and emissions reductions are simulated estimates based on assumed AC power, tariff, and emission factor. They are not measured physical savings from real electrical meters or real building deployments.
          </span>
        </div>
      </div>

      <section className="smart-card space-y-6 text-xs text-[var(--tx)]">
        <div>
          <h2 className="text-sm font-bold text-[var(--ac)] uppercase tracking-wider mb-2">
            1. Simulation Scope & System Purpose
          </h2>
          <p className="leading-relaxed text-[var(--tx)]/90">
            SmartCool models an occupancy-aware cooling control strategy engineered to reduce energy waste in educational and commercial facilities. By continuously modeling room occupancy via simulated PIR sensors and confirming vacancy through an auditable grace period (default 5 minutes), the system simulates compressor shutoff during lecture breaks and empty periods, without sacrificing occupant thermal comfort.
          </p>
        </div>

        <div className="border-t border-[var(--bd)] pt-4">
          <h2 className="text-sm font-bold text-[var(--ac)] uppercase tracking-wider mb-2">
            2. AC Power Models & Engineering Assumptions (Transparent Distinction)
          </h2>
          <div className="space-y-3 leading-relaxed">
            <p className="text-[var(--tx)]/90">
              The project incorporates two distinct modeling approximations across components. These are intentionally not unified silently:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1.5">
                <span className="font-semibold text-[var(--ac)] block">Dashboard Multi-Room Simulation Model</span>
                <p className="text-[var(--mu)] text-[11px] leading-relaxed">
                  Uses a dynamic thermodynamic load curve where individual AC power varies between <b>0.8 kW and 1.4 kW</b> based on the difference between current room temperature (T) and the comfort setpoint (24.0 °C).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1.5">
                <span className="font-semibold text-[var(--bl)] block">ESP32 / Wokwi Firmware Prototype Model</span>
                <p className="text-[var(--mu)] text-[11px] leading-relaxed">
                  Uses a nominal fixed <b>1.2 kW</b> profile per AC unit for microcontroller simulation. These two modeling levels serve different evaluation purposes and are documented separately.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--bd)] pt-4">
          <h2 className="text-sm font-bold text-[var(--ac)] uppercase tracking-wider mb-2">
            3. Thermodynamic Physics & Power Formulas (Dashboard Code)
          </h2>
          <div className="space-y-3 leading-relaxed">
            <p>
              In our simulation engine (<code>SimulationContext.tsx</code>), room temperature (T) and AC power (P) are evaluated at 1-minute discrete intervals:
            </p>
            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--bd)] font-mono space-y-2.5 text-[11px]">
              <div>
                <b className="text-[var(--ac)]">Compressor Power Function:</b>
                <br />
                P(t) = clamp(0.8 + (T(t) - T_set) × 0.1 + 0.05 × sin(t × 1.7 + unit_idx), 0.8, 1.4) kW
              </div>
              <div>
                <b className="text-[var(--ac)]">Room Thermal Dynamics:</b>
                <br />
                • Active cooling (k units ON of N): T(t+1) = T(t) + (T_target - T(t)) × 0.05 × (k / N) + 0.04 × sin(t / 3)
                <br />
                • Natural warming (units OFF): T(t+1) = T(t) + (T_ambient - T(t)) × 0.02
                <br />
                &nbsp;&nbsp;where T_ambient = 31.0 °C if occupied, 30.5 °C if empty; T_target = T_set - 0.6 °C.
              </div>
              <div>
                <b className="text-[var(--ac)]">Energy Integration:</b>
                <br />
                E_smart += sum(P_i / 60) kWh
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--bd)] pt-4">
          <h2 className="text-sm font-bold text-[var(--ac)] uppercase tracking-wider mb-2">
            4. Baseline Definition & Economic Assumptions
          </h2>
          <div className="space-y-2.5 text-[var(--tx)]/90 leading-relaxed">
            <p>
              <b>Conventional Baseline Definition:</b> The baseline models conventional uncontrolled facility practice: all AC units in the room remain continuously powered ON throughout the standard 9:00 AM – 3:00 PM operating day, continuing to draw power during class breaks, empty lecture periods, and schedule gaps.
            </p>
            <p>
              <b>Electricity Tariff:</b> <b>৳10.00 / kWh</b> (BDT), reflecting typical commercial/institutional power rates in Bangladesh.
            </p>
            <p>
              <b>Grid Emission Factor:</b> <b>0.696 kg CO₂e / kWh</b>, representing regional grid emission intensity for carbon accounting.
            </p>
            <p>
              <b>Comfort Setpoint:</b> <b>24.0 °C</b> thermostat cooling setpoint.
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--bd)] pt-4">
          <h2 className="text-sm font-bold text-[var(--ac)] uppercase tracking-wider mb-2">
            5. State Machine & Vacancy Confirmation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1.5">
              <span className="font-semibold text-[var(--ac)]">Motion Detection</span>
              <p className="text-[var(--mu)]">
                Simulated PIR detection event &rarr; Instant transition to OCCUPIED state &rarr; AC compressor engages immediately &rarr; Vacancy counter reset to 0.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1.5">
              <span className="font-semibold text-[var(--am)]">Vacancy Confirmation</span>
              <p className="text-[var(--mu)]">
                When room becomes empty, the vacancy counter tracks elapsed minutes without motion up to the configured limit (5 min). At 5 minutes, AC powers down and the timer holds at 05:00 / 05:00 until reoccupation.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--bd)] pt-4">
          <h2 className="text-sm font-bold text-[var(--ac)] uppercase tracking-wider mb-2">
            6. Scientific Transparency & Limitations
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--mu)]">
            <li>
              All metrics on this dashboard are generated by deterministic mathematical models. No physical ESP32 or DHT22 sensors are connected in this live web interface.
            </li>
            <li>
              Actual electricity savings in physical buildings depend on building insulation (R-value), sun exposure, window glazing, inverter compressor ramp profiles, and user compliance.
            </li>
            <li>
              Emissions avoidance calculations depend on the local electrical generation mix (gas, coal, hydro, solar) and use an assumed factor of 0.696 kg CO₂e/kWh.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
