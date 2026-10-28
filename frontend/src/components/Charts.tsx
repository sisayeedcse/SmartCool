"use client";

import React from "react";
import {
  T0,
  TE,
  clamp,
  formatNum,
  format12h,
  formatTimeShort,
  SCHEDULES,
  SCHEDULE_NAMES,
  Room,
  useSimulation,
} from "../context/SimulationContext";

// Temperature Trend SVG Chart
export function TemperatureTrendChart({ room }: { room: Room }) {
  const { settings } = useSimulation();
  const width = 460;
  const height = 230;
  const padLeft = 44;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 26;

  const yMin = 20;
  const yMax = 32;
  const yStep = 4;

  const scaleX = (val: number) =>
    padLeft + ((val - T0) / (TE - T0)) * (width - padLeft - padRight);
  const scaleY = (val: number) =>
    padTop + (1 - (val - yMin) / (yMax - yMin)) * (height - padTop - padBottom);

  const setpointY = scaleY(settings.set);

  // Generate SVG path for an array of points
  const makePath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    return points
      .filter((_, idx) => idx % 2 === 0 || idx === points.length - 1)
      .map((p, idx) => {
        const cmd = idx === 0 ? "M" : "L";
        const cx = scaleX(p.x).toFixed(1);
        const cy = scaleY(clamp(p.y, yMin, yMax)).toFixed(1);
        return `${cmd}${cx},${cy}`;
      })
      .join(" ");
  };

  const normalPoints = room.h.map((p) => ({ x: p.t, y: p.b }));
  const smartPoints = room.h.map((p) => ({ x: p.t, y: p.a }));

  const pathNormal = makePath(normalPoints);
  const pathSmart = makePath(smartPoints);

  // Horizontal grid lines
  const gridY: number[] = [];
  for (let y = yMin; y <= yMax; y += yStep) {
    gridY.push(y);
  }

  // Vertical time lines every 60 min
  const gridX: number[] = [];
  for (let x = T0; x <= TE; x += 60) {
    gridX.push(x);
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block select-none"
        role="img"
        aria-label="Temperature trend chart"
      >
        {/* Horizontal grid lines & labels */}
        {gridY.map((yVal) => {
          const py = scaleY(yVal);
          return (
            <g key={yVal}>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={py}
                y2={py}
                stroke="var(--bd)"
                strokeWidth="1"
              />
              <text
                x={padLeft - 6}
                y={py + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="var(--mu)"
                className="font-mono"
              >
                {yVal}°C
              </text>
            </g>
          );
        })}

        {/* Vertical hour lines & time labels */}
        {gridX.map((xVal) => {
          const px = scaleX(xVal);
          const hh = xVal / 60;
          const ampm = hh >= 12 ? "PM" : "AM";
          return (
            <g key={xVal}>
              <line
                x1={px}
                x2={px}
                y1={padTop}
                y2={height - padBottom}
                stroke="var(--bd)"
                strokeWidth="1"
              />
              <text
                x={px}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="var(--mu)"
                className="font-mono"
              >
                {format12h(hh)} {ampm}
              </text>
            </g>
          );
        })}

        {/* Setpoint Reference Line */}
        <line
          x1={padLeft}
          x2={width - padRight}
          y1={setpointY}
          y2={setpointY}
          stroke="var(--am)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Normal AC Line */}
        {pathNormal && (
          <path
            d={pathNormal}
            fill="none"
            stroke="var(--bl)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Smart AC Line */}
        {pathSmart && (
          <path
            d={pathSmart}
            fill="none"
            stroke="var(--ac)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--mu)] mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--bl)]" />
          <span>Normal AC (always on)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--ac)]" />
          <span>Smart AC (vacancy control)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-[var(--am)]" />
          <span>Setpoint {settings.set}°C</span>
        </span>
      </div>
    </div>
  );
}

// Energy Consumption Comparison SVG Chart
export function EnergyComparisonChart({ room }: { room: Room }) {
  const width = 460;
  const height = 230;
  const padLeft = 44;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 26;

  const maxVal = Math.max(room.en, room.e, 1);
  const yMax = Math.ceil(maxVal * 1.25);
  const yStep = Math.max(1, Math.round(yMax / 4));

  const scaleX = (val: number) =>
    padLeft + ((val - T0) / (TE - T0)) * (width - padLeft - padRight);
  const scaleY = (val: number) =>
    padTop + (1 - val / yMax) * (height - padTop - padBottom);

  const makePath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    return points
      .filter((_, idx) => idx % 2 === 0 || idx === points.length - 1)
      .map((p, idx) => {
        const cmd = idx === 0 ? "M" : "L";
        const cx = scaleX(p.x).toFixed(1);
        const cy = scaleY(clamp(p.y, 0, yMax)).toFixed(1);
        return `${cmd}${cx},${cy}`;
      })
      .join(" ");
  };

  const normalPoints = room.h.map((p) => ({ x: p.t, y: p.en }));
  const smartPoints = room.h.map((p) => ({ x: p.t, y: p.e }));

  const pathNormal = makePath(normalPoints);
  const pathSmart = makePath(smartPoints);

  const gridY: number[] = [];
  for (let y = 0; y <= yMax; y += yStep) {
    gridY.push(y);
  }

  const gridX: number[] = [];
  for (let x = T0; x <= TE; x += 60) {
    gridX.push(x);
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block select-none"
        role="img"
        aria-label="Energy comparison chart"
      >
        {gridY.map((yVal) => {
          const py = scaleY(yVal);
          return (
            <g key={yVal}>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={py}
                y2={py}
                stroke="var(--bd)"
                strokeWidth="1"
              />
              <text
                x={padLeft - 6}
                y={py + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="var(--mu)"
                className="font-mono"
              >
                {yVal}
              </text>
            </g>
          );
        })}

        {gridX.map((xVal) => {
          const px = scaleX(xVal);
          const hh = xVal / 60;
          const ampm = hh >= 12 ? "PM" : "AM";
          return (
            <g key={xVal}>
              <line
                x1={px}
                x2={px}
                y1={padTop}
                y2={height - padBottom}
                stroke="var(--bd)"
                strokeWidth="1"
              />
              <text
                x={px}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="var(--mu)"
                className="font-mono"
              >
                {format12h(hh)} {ampm}
              </text>
            </g>
          );
        })}

        {pathNormal && (
          <path
            d={pathNormal}
            fill="none"
            stroke="var(--bl)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {pathSmart && (
          <path
            d={pathSmart}
            fill="none"
            stroke="var(--ac)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--mu)] mt-2">
        <span className="font-medium text-[var(--tx)]">Energy (kWh, cumulative):</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded bg-[var(--bl)]" />
          <span>Normal AC</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1 rounded bg-[var(--ac)]" />
          <span>Smart AC</span>
        </span>
      </div>
    </div>
  );
}

// Activity Timeline
export function ActivityTimeline({ room }: { room: Room }) {
  const { t } = useSimulation();
  const schedule = SCHEDULES[room.sk] || SCHEDULES.A;

  const rows: { start: number; end: number; occupied: boolean; lectureNum: number }[] = [];
  let current = T0;
  let lectureIdx = 0;

  schedule.forEach(([start, end]) => {
    if (start > current) {
      rows.push({ start: current, end: start, occupied: false, lectureNum: 0 });
    }
    rows.push({ start, end, occupied: true, lectureNum: ++lectureIdx });
    current = end;
  });

  if (current < TE) {
    rows.push({ start: current, end: TE, occupied: false, lectureNum: 0 });
  }

  return (
    <div className="space-y-1.5">
      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
        {rows.map((row, idx) => {
          const isCurrent = t >= row.start && t < row.end;
          const isPast = t >= row.end;
          const label = row.occupied
            ? `Lecture ${row.lectureNum} (Occupied)`
            : row.end - row.start >= 30
            ? "Long break (Empty)"
            : "Break (Empty)";

          return (
            <div
              key={idx}
              className={`grid grid-cols-[74px_1fr_95px] sm:grid-cols-[88px_1fr_130px] gap-1.5 sm:gap-2 items-center text-[11px] sm:text-xs px-2 sm:px-2.5 py-1.5 rounded-md transition-all ${
                isCurrent
                  ? "bg-[var(--am)]/15 border border-[var(--am)] shadow-xs font-medium"
                  : "bg-[var(--bg)] border border-[var(--bd)]"
              }`}
            >
              <span className="font-mono text-[var(--mu)] truncate">
                {formatTimeShort(row.start)}–{formatTimeShort(row.end)}
              </span>

              <div className="w-full bg-[var(--bg)]/80 rounded-full h-2 overflow-hidden border border-[var(--bd)]">
                <div
                  className={`h-full rounded-full transition-all ${
                    row.occupied ? "bg-[#2cbf8c]" : "bg-[#6f86a6]/50"
                  } ${isPast ? "opacity-40" : ""}`}
                  style={{ width: "100%" }}
                />
              </div>

              <span
                className={`truncate ${
                  row.occupied ? "text-[var(--ac)]" : "text-[var(--mu)]"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-[var(--mu)] pt-1 border-t border-[var(--bd)]">
        Schedule preset: <b className="text-[var(--tx)]">{SCHEDULE_NAMES[room.sk]}</b>
      </div>
    </div>
  );
}

// Side-by-Side Comparative Bar SVG
export function ComparisonBars({
  normalVal,
  smartVal,
  formatDecimals = 2,
  unit = "",
}: {
  normalVal: number;
  smartVal: number;
  formatDecimals?: number;
  unit?: string;
}) {
  const max = Math.max(normalVal, smartVal, 0.01) * 1.25;
  const barMaxHeight = 110;
  const height = 150;
  const width = 200;

  const normalHeight = (normalVal / max) * barMaxHeight;
  const smartHeight = (smartVal / max) * barMaxHeight;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-[200px] h-auto mx-auto block select-none"
      role="img"
    >
      {/* Base line */}
      <line
        x1="12"
        x2="188"
        y1="124"
        y2="124"
        stroke="var(--bd)"
        strokeWidth="1.5"
      />

      {/* Normal AC Bar (Blue) */}
      <rect
        x="30"
        y={124 - normalHeight}
        width="54"
        height={normalHeight}
        rx="4"
        fill="var(--bl)"
      />
      <text
        x="57"
        y={118 - normalHeight}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="var(--tx)"
      >
        {formatNum(normalVal, formatDecimals)}
        {unit}
      </text>
      <text
        x="57"
        y="140"
        textAnchor="middle"
        fontSize="11"
        fill="var(--mu)"
      >
        Normal AC
      </text>

      {/* Smart AC Bar (Mint Green) */}
      <rect
        x="116"
        y={124 - smartHeight}
        width="54"
        height={smartHeight}
        rx="4"
        fill="var(--ac)"
      />
      <text
        x="143"
        y={118 - smartHeight}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="var(--tx)"
      >
        {formatNum(smartVal, formatDecimals)}
        {unit}
      </text>
      <text
        x="143"
        y="140"
        textAnchor="middle"
        fontSize="11"
        fill="var(--mu)"
      >
        Smart AC
      </text>
    </svg>
  );
}

// Savings Card Box
export function SavingsCard({
  savedKwh,
  savedPct,
  savedCostBdt,
  avoidedCo2Kg,
  tariff,
  ef,
}: {
  savedKwh: number;
  savedPct: number;
  savedCostBdt: number;
  avoidedCo2Kg: number;
  tariff: number;
  ef: number;
}) {
  return (
    <div className="bg-[var(--sv)] text-[var(--svt)] rounded-xl p-4 shadow-sm flex flex-col justify-between">
      <div className="font-extrabold text-sm tracking-tight border-b border-[var(--svt)]/20 pb-2">
        Energy & Cost Savings
      </div>

      <div className="space-y-3 my-2 text-xs">
        <div>
          <b className="text-lg leading-tight block font-bold">
            {formatNum(savedKwh)} kWh
          </b>
          <span className="opacity-90 font-medium">({formatNum(savedPct, 1)}% less energy)</span>
        </div>

        <div>
          <b className="text-lg leading-tight block font-bold">
            ৳ {formatNum(savedCostBdt)}
          </b>
          <span className="opacity-90 font-medium">(at ৳{tariff}/kWh tariff)</span>
        </div>

        <div>
          <b className="text-lg leading-tight block font-bold">
            {formatNum(avoidedCo2Kg)} kg CO₂e
          </b>
          <span className="opacity-90 font-medium">(at {ef} kg/kWh factor)</span>
        </div>
      </div>

      <div className="text-[10px] font-semibold opacity-75 pt-1 border-t border-[var(--svt)]/20">
        Continuous vacancy confirmation
      </div>
    </div>
  );
}
