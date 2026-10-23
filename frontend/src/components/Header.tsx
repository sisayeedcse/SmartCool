"use client";

import React from "react";
import { useSimulation, formatTimeStr } from "../context/SimulationContext";
import { Play, Pause, Sun, Moon, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Header() {
  const {
    t,
    isRunning,
    setIsRunning,
    isDayComplete,
    selectedRoom,
    theme,
    toggleTheme,
  } = useSimulation();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-[var(--bd)] bg-[var(--pn)]/80 backdrop-blur sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <svg
          width="36"
          height="36"
          viewBox="0 0 40 40"
          aria-hidden="true"
          className="shrink-0 drop-shadow-sm"
        >
          <path
            d="M8 32C6 16 16 6 34 5c1 16-7 27-22 27z"
            fill="var(--ac)"
          />
          <path
            d="M10 31C16 20 22 14 30 9"
            stroke="var(--bg)"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--tx)]">
              SmartCool Energy Saver
            </h1>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[var(--ac)]/15 text-[var(--ac)] border border-[var(--ac)]/30">
              Multi-Room
            </span>
          </div>
          <p className="text-xs text-[var(--mu)] hidden sm:block">
            Smarter cooling, lower energy, greener tomorrow
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-medium ml-auto">
        {/* Status dot and label */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--bd)]">
          <span
            className={`w-2 h-2 rounded-full ${
              isDayComplete
                ? "bg-[var(--am)]"
                : isRunning
                ? "bg-[var(--ac)] animate-pulse"
                : "bg-[var(--am)]"
            }`}
          />
          <span className="text-[var(--tx)]">
            {isDayComplete
              ? "Day complete"
              : isRunning
              ? "System online"
              : "Paused"}
          </span>
        </div>

        {/* Selected Room indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--bd)] text-[var(--mu)]">
          <span>Active:</span>
          <b className="text-[var(--tx)] font-semibold">{selectedRoom.name}</b>
        </div>

        {/* Simulated date & time */}
        <div className="px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--bd)] text-[var(--tx)] font-mono tracking-tight font-semibold">
          14 Apr 2025 &nbsp;{formatTimeStr(t)}
        </div>

        {/* Pause / Resume Button */}
        <button
          onClick={() => setIsRunning((prev) => !prev)}
          disabled={isDayComplete}
          className={`smart-btn text-xs px-3 py-1.5 ${
            isRunning
              ? "bg-[var(--pn)] hover:border-[var(--am)] hover:text-[var(--am)]"
              : "smart-btn-primary"
          }`}
          title={isDayComplete ? "Simulation finished for the day" : isRunning ? "Pause simulation (Space)" : "Resume simulation (Space)"}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="smart-btn p-1.5 rounded-lg"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-[var(--am)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--bl)]" />
          )}
        </button>
      </div>
    </header>
  );
}
