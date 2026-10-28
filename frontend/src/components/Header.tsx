"use client";

import React, { useState, useEffect } from "react";
import { useSimulation, formatTimeStr } from "../context/SimulationContext";
import { Play, Pause, Sun, Moon, Clock, Menu, X } from "lucide-react";

export default function Header() {
  const {
    t,
    isRunning,
    setIsRunning,
    isDayComplete,
    selectedRoom,
    theme,
    toggleTheme,
    mobileMenuOpen,
    toggleMobileMenu,
  } = useSimulation();

  const [bdTime, setBdTime] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-GB", {
        timeZone: "Asia/Dhaka",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setBdTime({ date: dateStr, time: timeStr });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-[var(--bd)] bg-[var(--pn)]/80 backdrop-blur sticky top-0 z-30 transition-colors">
      {/* Brand logo & title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle (Visible on screens < 1024px) */}
        <button
          onClick={toggleMobileMenu}
          className="p-1.5 sm:p-2 rounded-lg text-[var(--tx)] hover:bg-[var(--bg)] border border-[var(--bd)] lg:hidden shrink-0"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileMenuOpen ? (
            <X className="w-4 h-4 text-[var(--ac)]" />
          ) : (
            <Menu className="w-4 h-4 text-[var(--tx)]" />
          )}
        </button>

        <svg
          width="32"
          height="32"
          viewBox="0 0 40 40"
          aria-hidden="true"
          className="shrink-0 drop-shadow-sm w-7 h-7 sm:w-9 sm:h-9"
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

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-base lg:text-xl font-bold tracking-tight text-[var(--tx)] truncate">
              SmartCool Energy Saver
            </h1>
            <span className="hidden md:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[var(--ac)]/15 text-[var(--ac)] border border-[var(--ac)]/30 shrink-0">
              Multi-Room
            </span>
          </div>
          <p className="text-[11px] text-[var(--mu)] hidden xl:block">
            Smarter cooling, lower energy, greener tomorrow
          </p>
        </div>
      </div>

      {/* Header controls & live indicators */}
      <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-medium shrink-0">
        {/* Status dot and label */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--bd)] text-[11px]">
          <span
            className={`w-2 h-2 rounded-full ${
              isDayComplete
                ? "bg-[var(--am)]"
                : isRunning
                ? "bg-[var(--ac)] animate-pulse"
                : "bg-[var(--am)]"
            }`}
          />
          <span className="text-[var(--tx)] hidden md:inline">
            {isDayComplete
              ? "Day complete"
              : isRunning
              ? "System online"
              : "Paused"}
          </span>
        </div>

        {/* Selected Room indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--bd)] text-[var(--mu)]">
          <span>Active:</span>
          <b className="text-[var(--tx)] font-semibold">{selectedRoom.name}</b>
        </div>

        {/* BD System Time (Live Bangladesh Standard Time) */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--bd)] text-[var(--tx)] font-mono tracking-tight text-[10px] sm:text-xs shadow-sm"
          title="Current System Time (Bangladesh Standard Time - Asia/Dhaka, UTC+06:00)"
        >
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--ac)] shrink-0 animate-pulse" />
          <span className="font-semibold hidden md:inline">{bdTime ? bdTime.date : "BD Time"}</span>
          <span className="text-[var(--ac)] font-bold">{bdTime ? bdTime.time : "..."}</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--ac)]/15 text-[var(--ac)] font-sans font-semibold uppercase">
            BST
          </span>
        </div>

        {/* Workday Simulation Schedule Clock */}
        <div
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--bd)] text-[var(--tx)] font-mono tracking-tight text-xs text-[var(--mu)]"
          title="Simulated Workday Schedule (9:00 AM – 3:00 PM)"
        >
          <span className="text-[10px] uppercase font-sans font-semibold text-[var(--mu)]">Sim:</span>
          <b className="text-[var(--tx)] font-semibold">{formatTimeStr(t)}</b>
        </div>

        {/* Pause / Resume Button */}
        <button
          onClick={() => setIsRunning((prev) => !prev)}
          disabled={isDayComplete}
          className={`smart-btn text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 ${
            isRunning
              ? "bg-[var(--pn)] hover:border-[var(--am)] hover:text-[var(--am)]"
              : "smart-btn-primary"
          }`}
          title={isDayComplete ? "Simulation finished for the day" : isRunning ? "Pause simulation (Space)" : "Resume simulation (Space)"}
        >
          {isRunning ? (
            <>
              <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Resume</span>
            </>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="smart-btn p-1.5 sm:p-2 rounded-lg"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--am)]" />
          ) : (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--bl)]" />
          )}
        </button>
      </div>
    </header>
  );
}
