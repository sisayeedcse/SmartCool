"use client";

import React from "react";
import Link from "next/link";
import {
  useSimulation,
  calculateRoomMetrics,
  formatNum,
  formatDuration,
  formatTimeShort,
  TE,
  T0,
} from "../context/SimulationContext";
import RoomIllustration from "../components/RoomIllustration";
import {
  TemperatureTrendChart,
  EnergyComparisonChart,
  ActivityTimeline,
  ComparisonBars,
  SavingsCard,
} from "../components/Charts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Power,
  Sliders,
  CheckCircle2,
  Clock,
  Thermometer,
  Zap,
  Activity,
  ChevronRight,
  Radio,
  Info,
} from "lucide-react";

export default function DashboardPage() {
  const {
    rooms,
    selectedRoomIdx,
    setSelectedRoomIdx,
    selectedRoom,
    settings,
    events,
    isRunning,
    setIsRunning,
    toggleAcPower,
    toggleAcMode,
    setRoomForce,
    getRoomPower,
    totals,
  } = useSimulation();

  // Keyboard navigation shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      } else if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < rooms.length) {
          setSelectedRoomIdx(idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rooms.length, setIsRunning, setSelectedRoomIdx]);

  const r = selectedRoom;
  const rm = calculateRoomMetrics(r, settings.tariff, settings.ef);
  const roomPower = getRoomPower(r);
  const runtimePct = Math.min(100, Math.round((100 * r.run) / (TE - T0)));

  // Temperature status tag
  const tempStatus =
    r.temp < 23
      ? { label: "Cool", cls: "badge-cool" }
      : r.temp > 26.5
      ? { label: "Warm", cls: "badge-warn" }
      : { label: "Comfortable", cls: "badge-ok" };

  // Filter recent events for this room
  const recentEvents = events
    .filter((e) => e.room === r.name)
    .slice(0, 7);

  return (
    <main className="max-w-[1440px] mx-auto p-4 sm:p-6 space-y-5">
      {/* Simulation Transparency & Honesty Banner */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--pn)] border border-[var(--bd)] text-xs text-[var(--mu)]">
        <Info className="w-4 h-4 text-[var(--ac)] shrink-0" />
        <span>
          <strong className="text-[var(--tx)]">Simulation Prototype:</strong> Simulated estimates based on assumed AC power (0.8–1.4 kW), tariff (৳{settings.tariff}/kWh) and emission factor ({settings.ef} kg CO₂e/kWh). Not measured savings.
        </span>
      </div>

      {/* 1. Global Multi-Room Summary KPIs (Single Source of Truth from totals) */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <SummaryCard
          title="Rooms"
          main={`${totals.totalRooms}`}
          sub={`${totals.occupiedRooms} occupied now`}
          highlight={totals.occupiedRooms > 0}
        />
        <SummaryCard
          title="AC units on"
          main={`${totals.onAcs} / ${totals.totalAcs}`}
          sub={`${formatNum(totals.totalPowerKw, 2)} kW current draw`}
          highlight={totals.onAcs > 0}
        />
        <SummaryCard
          title="Energy today"
          main={`${formatNum(totals.totalSmartEnergyKwh, 2)} kWh`}
          sub={`Normal AC: ${formatNum(totals.totalNormalEnergyKwh, 2)} kWh`}
        />
        <SummaryCard
          title="Cost today"
          main={`৳ ${formatNum(totals.totalSmartCostBdt, 2)}`}
          sub={`Saved ৳ ${formatNum(totals.totalSavedCostBdt, 2)}`}
          badge={`-${formatNum(totals.savingsPercent, 1)}%`}
          badgeSub="Simulated reduction"
        />
        <SummaryCard
          title="CO₂e today"
          main={`${formatNum(totals.totalSmartCo2Kg, 2)} kg`}
          sub={`Avoided ${formatNum(totals.totalSavedCo2Kg, 2)} kg`}
          highlightGreen
        />
      </section>

      {/* 2. Room Selection Chips Bar */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--mu)] uppercase tracking-wider">
              Select Room to Monitor & Control
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[var(--mu)] bg-[var(--pn)] px-2 py-0.5 rounded-md border border-[var(--bd)] font-medium">
              <span>Keys</span>
              <kbd className="px-1 py-0.2 bg-[var(--bg)] border border-[var(--bd)] rounded font-mono text-[10px] text-[var(--tx)]">1-4</kbd>
              <span>switch</span>
              <span>·</span>
              <kbd className="px-1 py-0.2 bg-[var(--bg)] border border-[var(--bd)] rounded font-mono text-[10px] text-[var(--tx)]">Space</kbd>
              <span>pause</span>
            </span>
          </div>
          <span className="text-xs text-[var(--mu)]">
            {rooms.length} rooms in facility
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5 pb-1">
          {rooms.map((room, idx) => {
            const isSelected = idx === selectedRoomIdx;
            const onUnits = room.acs.filter((a) => a.on).length;
            const pwr = getRoomPower(room);

            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoomIdx(idx)}
                className={`text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                  isSelected
                    ? "bg-[var(--pn)] border-[var(--ac)] shadow-sm ring-1 ring-[var(--ac)]"
                    : "bg-[var(--pn)]/60 border-[var(--bd)] hover:border-[var(--ac)]/50"
                }`}
              >
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      room.occ ? "bg-[var(--ac)] animate-pulse" : "bg-[var(--am)]"
                    }`}
                  />
                  <span className="text-[9px] font-mono font-bold text-[var(--mu)] mt-0.5">
                    {idx + 1}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--tx)]">{room.name}</div>
                  <div className="text-[11px] text-[var(--mu)]">
                    {onUnits}/{room.acs.length} AC on · {formatNum(pwr, 2)} kW
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Row 1, Left: Live Room Status & AC Controls (span 7) */}
        <section className="smart-card col-span-12 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[var(--bd)] pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[var(--ac)]" />
                <h2 className="text-sm font-bold text-[var(--tx)]">
                  Live Room Status – {r.name}
                </h2>
              </div>
              <span className="text-xs text-[var(--mu)]">
                {r.acs.length} cooling unit{r.acs.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Illustration & status cards */}
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-4">
              <RoomIllustration room={r} />

              <div className="grid grid-cols-2 gap-2 content-start">
                <StatusMiniCard
                  label="Temperature"
                  val={`${formatNum(r.temp, 1)} °C`}
                  badge={<span className={tempStatus.cls}>{tempStatus.label}</span>}
                />
                <StatusMiniCard
                  label="Occupancy"
                  val={r.occ ? "Occupied" : "Vacant"}
                  sub={r.occ ? "Motion detected" : "No motion"}
                  ok={r.occ}
                />
                <StatusMiniCard
                  label="AC status"
                  val={`${r.acs.filter((a) => a.on).length} of ${r.acs.length} ON`}
                  sub="Auto vacancy control"
                />
                <StatusMiniCard
                  label="Current power"
                  val={`${formatNum(roomPower, 2)} kW`}
                  sub="0.8 – 1.4 kW per AC"
                />
              </div>
            </div>

            {/* Sensor Simulation controls */}
            <div className="mt-4 pt-3 border-t border-[var(--bd)] flex flex-wrap items-center gap-2 text-xs text-[var(--mu)]">
              <span className="font-semibold text-[var(--tx)]">Simulate sensor:</span>
              <button
                onClick={() => setRoomForce(selectedRoomIdx, null)}
                className={`smart-btn text-xs py-1 px-2.5 ${
                  r.force === null ? "smart-btn-primary" : ""
                }`}
              >
                Follow schedule
              </button>
              <button
                onClick={() => setRoomForce(selectedRoomIdx, true)}
                className={`smart-btn text-xs py-1 px-2.5 ${
                  r.force === true ? "smart-btn-primary" : ""
                }`}
              >
                Force occupied
              </button>
              <button
                onClick={() => setRoomForce(selectedRoomIdx, false)}
                className={`smart-btn text-xs py-1 px-2.5 ${
                  r.force === false ? "smart-btn-primary" : ""
                }`}
              >
                Force vacant
              </button>
            </div>
          </div>

          {/* AC Units in this room */}
          <div className="mt-4">
            <div className="text-xs font-semibold text-[var(--mu)] uppercase tracking-wider mb-2">
              Individual Unit Controls
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {r.acs.map((ac, acIdx) => (
                <div
                  key={ac.n}
                  className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--bd)] flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--tx)]">{ac.n}</span>
                    <span className={ac.on ? "badge-ok" : "badge-off"}>
                      {ac.on ? "ON" : "OFF"}
                    </span>
                  </div>

                  <div className="text-[11px] text-[var(--mu)]">
                    {formatNum(ac.p, 2)} kW ·{" "}
                    <span className="capitalize">{ac.mode}</span>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => toggleAcPower(selectedRoomIdx, acIdx)}
                      className={`flex-1 text-[11px] py-1 px-2 rounded font-medium border border-[var(--bd)] transition-all ${
                        ac.on
                          ? "bg-[var(--pn)] text-[var(--tx)] hover:border-[var(--rd)] hover:text-[var(--rd)]"
                          : "bg-[var(--ac)] text-[#04251a] font-semibold"
                      }`}
                    >
                      Turn {ac.on ? "off" : "on"}
                    </button>
                    <button
                      onClick={() => toggleAcMode(selectedRoomIdx, acIdx)}
                      className="text-[11px] py-1 px-2 rounded bg-[var(--pn)] text-[var(--mu)] hover:text-[var(--tx)] border border-[var(--bd)] hover:border-[var(--ac)]"
                      title="Switch between automatic schedule/sensor mode and manual override"
                    >
                      {ac.mode === "auto" ? "Manual" : "Auto"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Row 1, Right: Event Summary (Today) (span 5) */}
        <section className="smart-card col-span-12 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[var(--bd)] pb-2.5">
              <h2 className="text-sm font-bold text-[var(--tx)]">
                Event summary (today) – {r.name}
              </h2>
              <span className="text-xs text-[var(--mu)]">Simulated metrics</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1.5">
                <span className="text-xs text-[var(--mu)] block">Total runtime</span>
                <b className="text-xl font-bold text-[var(--tx)] block font-mono">
                  {formatDuration(r.run)}
                </b>
                <div className="w-full bg-[var(--pn)] h-2 rounded-full overflow-hidden border border-[var(--bd)]">
                  <div
                    className="h-full bg-[var(--ac)] transition-all"
                    style={{ width: `${runtimePct}%` }}
                  />
                </div>
                <div className="text-[11px] text-[var(--mu)] flex justify-between">
                  <span>out of 6 hours</span>
                  <span className="font-semibold text-[var(--tx)]">{runtimePct}%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1.5">
                <span className="text-xs text-[var(--mu)] block">Energy consumed</span>
                <b className="text-xl font-bold text-[var(--tx)] block font-mono">
                  {formatNum(rm.smartKwh, 2)} kWh
                </b>
                <DeltaBadge pct={rm.savingsPercent} />
                <span className="text-[11px] text-[var(--mu)] block">
                  Normal AC: {formatNum(rm.normalKwh, 2)} kWh
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1.5">
                <span className="text-xs text-[var(--mu)] block">Estimated cost</span>
                <b className="text-xl font-bold text-[var(--tx)] block font-mono">
                  ৳ {formatNum(rm.smartCost, 2)}
                </b>
                <DeltaBadge pct={rm.savingsPercent} />
                <span className="text-[11px] text-[var(--mu)] block">
                  at ৳{settings.tariff}/kWh
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1.5">
                <span className="text-xs text-[var(--mu)] block">CO₂e emissions</span>
                <b className="text-xl font-bold text-[var(--tx)] block font-mono">
                  {formatNum(rm.smartCo2, 2)} kg
                </b>
                <DeltaBadge pct={rm.savingsPercent} />
                <span className="text-[11px] text-[var(--mu)] block">
                  at {settings.ef} kg/kWh
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--bd)] flex items-center justify-between text-xs text-[var(--mu)]">
            <span>Energy profile: 0.8–1.4 kW thermal dynamic</span>
            <Link
              href="/analytics"
              className="text-[var(--ac)] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Detailed Analytics <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Row 2: 3 Columns (4 cols each) */}
        {/* Col 1: Temperature Trend */}
        <section className="smart-card col-span-12 md:col-span-6 lg:col-span-4">
          <div className="flex items-center justify-between mb-3 border-b border-[var(--bd)] pb-2">
            <h3 className="text-xs font-bold text-[var(--tx)] uppercase tracking-wider">
              Temperature Trend – {r.name}
            </h3>
            <span className="text-xs font-mono text-[var(--ac)]">
              {formatNum(r.temp, 1)}°C
            </span>
          </div>
          <TemperatureTrendChart room={r} />
        </section>

        {/* Col 2: Energy Consumption Comparison */}
        <section className="smart-card col-span-12 md:col-span-6 lg:col-span-4">
          <div className="flex items-center justify-between mb-3 border-b border-[var(--bd)] pb-2">
            <h3 className="text-xs font-bold text-[var(--tx)] uppercase tracking-wider">
              Energy Comparison (Cumulative)
            </h3>
            <span className="text-xs font-mono text-[var(--tx)]">
              {formatNum(rm.smartKwh, 2)} / {formatNum(rm.normalKwh, 2)} kWh
            </span>
          </div>
          <EnergyComparisonChart room={r} />
        </section>

        {/* Col 3: Room Activity Timeline */}
        <section className="smart-card col-span-12 lg:col-span-4">
          <div className="flex items-center justify-between mb-3 border-b border-[var(--bd)] pb-2">
            <h3 className="text-xs font-bold text-[var(--tx)] uppercase tracking-wider">
              Room Activity Timeline
            </h3>
            <span className="text-xs text-[var(--mu)]">Daily schedule</span>
          </div>
          <ActivityTimeline room={r} />
        </section>

        {/* Row 3: Energy & Cost Analysis (span 7) & Recent Events (span 5) */}
        <section className="smart-card col-span-12 lg:col-span-7">
          <div className="flex items-center justify-between mb-3 border-b border-[var(--bd)] pb-2">
            <h3 className="text-xs font-bold text-[var(--tx)] uppercase tracking-wider">
              Energy & Cost Analysis – {r.name}
            </h3>
            <span className="text-xs text-[var(--ac)] font-semibold">
              {formatNum(rm.savingsPercent, 1)}% Simulated Reduction
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--bd)] flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--mu)] block mb-1">
                Electricity (kWh)
              </span>
              <ComparisonBars
                normalVal={rm.normalKwh}
                smartVal={rm.smartKwh}
                formatDecimals={2}
              />
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--bd)] flex flex-col justify-between">
              <span className="text-xs font-semibold text-[var(--mu)] block mb-1">
                Estimated Cost (৳)
              </span>
              <ComparisonBars
                normalVal={rm.normalCost}
                smartVal={rm.smartCost}
                formatDecimals={2}
              />
            </div>

            <SavingsCard
              savedKwh={rm.savedKwh}
              savedPct={rm.savingsPercent}
              savedCostBdt={rm.savedCost}
              avoidedCo2Kg={rm.savedCo2}
              tariff={settings.tariff}
              ef={settings.ef}
            />
          </div>
        </section>

        <section className="smart-card col-span-12 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[var(--bd)] pb-2">
              <h3 className="text-xs font-bold text-[var(--tx)] uppercase tracking-wider">
                Recent Events – {r.name}
              </h3>
              <Link
                href="/events"
                className="text-xs text-[var(--ac)] hover:underline font-semibold"
              >
                View all ({events.length})
              </Link>
            </div>

            <div className="space-y-2">
              {recentEvents.length > 0 ? (
                recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start gap-2.5 text-xs py-1 border-b border-[var(--bd)]/40 last:border-0"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        evt.ty === "off"
                          ? "bg-[var(--rd)]"
                          : evt.ty === "info"
                          ? "bg-[var(--am)]"
                          : "bg-[var(--ac)]"
                      }`}
                    />
                    <time className="font-mono text-[var(--mu)] shrink-0 w-11">
                      {formatTimeShort(evt.t)}
                    </time>
                    <span className="text-[var(--tx)] leading-tight">{evt.m}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--mu)] py-4 text-center">
                  No events recorded yet for this room.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--bd)]">
            <Link
              href="/events"
              className="smart-btn w-full text-center text-xs justify-center"
            >
              Browse Complete System Log
            </Link>
          </div>
        </section>
      </div>

      {/* Footer disclaimer note */}
      <footer className="pt-4 border-t border-[var(--bd)] text-xs text-[var(--mu)] flex flex-wrap gap-4 items-center justify-between">
        <span>
          Note: This dashboard shows data from a simulated multi-room environment. Simulated estimates based on assumed AC power, tariff and emission factor. Not measured savings.
        </span>
        <span className="font-semibold text-[var(--ac)]">
          Simulation Prototype · Research & Energy-Efficiency Study
        </span>
      </footer>
    </main>
  );
}

function SummaryCard({
  title,
  main,
  sub,
  highlight,
  highlightGreen,
  badge,
  badgeSub,
}: {
  title: string;
  main: string;
  sub: string;
  highlight?: boolean;
  highlightGreen?: boolean;
  badge?: string;
  badgeSub?: string;
}) {
  return (
    <div className="smart-card space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--mu)] font-medium">{title}</span>
        {badge && (
          <div className="text-right">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--ac)]/15 text-[var(--ac)]">
              {badge}
            </span>
            {badgeSub && <span className="block text-[9px] text-[var(--mu)] mt-0.5">{badgeSub}</span>}
          </div>
        )}
      </div>
      <b
        className={`text-2xl font-bold block tracking-tight ${
          highlightGreen
            ? "text-[var(--ac)]"
            : highlight
            ? "text-[var(--tx)]"
            : "text-[var(--tx)]"
        }`}
      >
        {main}
      </b>
      <span className="text-[11px] text-[var(--mu)] block truncate">{sub}</span>
    </div>
  );
}

function StatusMiniCard({
  label,
  val,
  sub,
  badge,
  ok,
}: {
  label: string;
  val: string;
  sub?: string;
  badge?: React.ReactNode;
  ok?: boolean;
}) {
  return (
    <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--bd)] space-y-1">
      <span className="text-[11px] text-[var(--mu)] block font-medium">{label}</span>
      <div className="flex items-center justify-between gap-1">
        <b
          className={`text-sm font-bold truncate ${
            ok === true
              ? "text-[var(--ac)]"
              : ok === false
              ? "text-[var(--mu)]"
              : "text-[var(--tx)]"
          }`}
        >
          {val}
        </b>
        {badge}
      </div>
      {sub && <span className="text-[10px] text-[var(--mu)] block truncate">{sub}</span>}
    </div>
  );
}

function DeltaBadge({ pct }: { pct: number }) {
  const isGood = pct >= 0;
  return (
    <div
      className={`text-xs font-semibold flex items-center gap-1 ${
        isGood ? "text-[var(--ac)]" : "text-[var(--rd)]"
      }`}
    >
      {isGood ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
      <span>{formatNum(Math.abs(pct), 1)}%</span>
      <span className="text-[10px] text-[var(--mu)] font-normal">vs. normal</span>
    </div>
  );
}
