"use client";

import React from "react";
import { Room, useSimulation } from "../context/SimulationContext";

interface RoomIllustrationProps {
  room: Room;
}

export default function RoomIllustration({ room }: RoomIllustrationProps) {
  const { settings, getRoomMode } = useSimulation();
  const isAcOn = room.acs.some((a) => a.on);
  const mode = getRoomMode(room);

  // Clamped vacancy minutes ensure elapsed vacancy time never exceeds the configured delay limit in the display
  const displayVac = Math.min(room.vac, settings.vac);
  const vacMins = String(displayVac).padStart(2, "0");
  const limitMins = String(settings.vac).padStart(2, "0");

  return (
    <div className="w-full space-y-2.5">
      {/* SVG Room graphic */}
      <div className="relative w-full overflow-hidden rounded-xl border border-[var(--bd)] shadow-inner bg-[#9fb8c8]/20">
        <svg
          viewBox="0 0 320 170"
          className="w-full h-auto block select-none"
          role="img"
          aria-label={`Interactive illustration for ${room.name}`}
        >
          {/* Wall background */}
          <rect width="320" height="170" fill="#7d9db3" />

          {/* Wooden Floor */}
          <rect y="118" width="320" height="52" fill="#b08b5e" />
          <line x1="0" y1="118" x2="320" y2="118" stroke="#947148" strokeWidth="1.5" />

          {/* Classroom window on the left */}
          <rect
            x="14"
            y="26"
            width="46"
            height="64"
            rx="4"
            fill="#8fc4ea"
            stroke="#eef3f6"
            strokeWidth="3.5"
          />
          <line x1="37" y1="26" x2="37" y2="90" stroke="#eef3f6" strokeWidth="2" />
          <line x1="14" y1="58" x2="60" y2="58" stroke="#eef3f6" strokeWidth="2" />
          {/* Window sunlight sheen */}
          <polygon points="16,28 32,28 16,56" fill="#ffffff" opacity="0.35" />

          {/* Wooden Door on the right */}
          <rect
            x="262"
            y="38"
            width="34"
            height="80"
            rx="2"
            fill="#6d4424"
            stroke="#4e2f17"
            strokeWidth="1.5"
          />
          <circle cx="268" cy="80" r="2.5" fill="#e5b869" />

          {/* Wall mounted AC Indoor Unit */}
          <rect
            x="108"
            y="14"
            width="104"
            height="30"
            rx="5"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1"
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
          />
          {/* AC grill slit */}
          <rect
            x="116"
            y="34"
            width="88"
            height="4"
            rx="2"
            fill={isAcOn ? "#2ee6a0" : "#94a3b8"}
          />
          {/* AC Brand dot */}
          <circle cx="120" cy="22" r="1.5" fill="#94a3b8" />
          {/* AC Display text */}
          <text
            x="160"
            y="25"
            fontSize="7"
            fontWeight="bold"
            fill={isAcOn ? "#0f766e" : "#64748b"}
            textAnchor="middle"
          >
            {isAcOn ? `${settings.set}°C COOL` : "OFF"}
          </text>

          {/* Animated Cool Air Flow (shown only when AC is ON) */}
          {isAcOn && (
            <g className="animate-airflow">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect
                  key={i}
                  x={120 + i * 14}
                  y={40}
                  width="4"
                  height={24 + (i % 2) * 12}
                  rx="2"
                  fill="#67e8f9"
                  opacity={0.65}
                />
              ))}
              {/* Soft airflow curved paths */}
              <path
                d="M 122 42 Q 130 65 140 85"
                stroke="#67e8f9"
                strokeWidth="2"
                strokeDasharray="4 2"
                fill="none"
                opacity="0.45"
              />
              <path
                d="M 198 42 Q 190 65 180 85"
                stroke="#67e8f9"
                strokeWidth="2"
                strokeDasharray="4 2"
                fill="none"
                opacity="0.45"
              />
            </g>
          )}

          {/* Classroom Desks */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              {/* Desk Surface */}
              <rect
                x={60 + i * 78}
                y={124}
                width="62"
                height="9"
                rx="1"
                fill="#855223"
                stroke="#5c3614"
                strokeWidth="1"
              />
              {/* Desk Legs */}
              <rect x={64 + i * 78} y={133} width="3" height="24" fill="#334155" />
              <rect x={115 + i * 78} y={133} width="3" height="24" fill="#334155" />
            </g>
          ))}

          {/* Dynamic People / Occupants (Rendered when room is occupied!) */}
          {room.occ && (
            <g>
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  {/* Head */}
                  <circle cx={91 + i * 78} cy={110} r="7.5" fill="#1e3a5f" />
                  {/* Body/Shoulders */}
                  <path
                    d={`M ${79 + i * 78} 124 C ${80 + i * 78} 117, ${102 + i * 78} 117, ${103 + i * 78} 124 Z`}
                    fill="#2b4a63"
                  />
                </g>
              ))}
            </g>
          )}
        </svg>

        {/* Live overlay badge in top right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg)]/90 backdrop-blur border border-[var(--bd)] text-[10px] font-semibold text-[var(--tx)]">
          <span
            className={`w-2 h-2 rounded-full ${
              room.occ ? "bg-[var(--ac)] animate-pulse" : "bg-[var(--mu)]"
            }`}
          />
          <span>{room.occ ? "Motion Detected" : "Vacant Room"}</span>
        </div>
      </div>

      {/* Badges beneath the room */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--bd)]">
          <span className="text-[var(--mu)]">Room Mode:</span>
          <b
            className={`font-semibold ${
              mode === "auto" ? "text-[var(--ac)]" : "text-[var(--am)]"
            }`}
          >
            {mode.toUpperCase()}
          </b>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--bd)]">
          <span className="text-[var(--mu)]">Vacancy Timer:</span>
          <b
            className={`font-mono font-semibold ${
              room.vac >= settings.vac ? "text-[var(--rd)]" : "text-[var(--ac)]"
            }`}
          >
            {vacMins}:00 / {limitMins}:00
          </b>
        </div>
      </div>
    </div>
  );
}
