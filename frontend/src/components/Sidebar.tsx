"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Waves,
  BarChart3,
  Leaf,
  Scale,
  FileText,
  FlaskConical,
  Settings2,
  BookOpen,
  Download,
  Power,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/monitoring", label: "Live data", icon: Waves },
  { href: "/analytics", label: "Energy & cost", icon: BarChart3 },
  { href: "/carbon", label: "Carbon impact", icon: Leaf },
  { href: "/events", label: "Event log", icon: FileText },
  { href: "/lab", label: "Simulation Lab", icon: FlaskConical },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/reports", label: "Reports & CSV", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings2 },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {
    selectedRoom,
    selectedRoomIdx,
    getRoomMode,
    setRoomMode,
    toggleRoomMode,
    toggleAllAcInRoom,
    resetRoom,
  } = useSimulation();

  const currentMode = getRoomMode(selectedRoom);
  const allOn = selectedRoom.acs.every((a) => a.on);

  return (
    <aside className="w-64 shrink-0 bg-[var(--pn)] border-r border-[var(--bd)] flex flex-col h-screen sticky top-0 overflow-y-auto transition-colors z-20">
      {/* Brand area */}
      <div className="p-4 border-b border-[var(--bd)] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[var(--ac)]/15 border border-[var(--ac)]/30 flex items-center justify-center text-[var(--ac)] font-bold text-base">
          SC
        </div>
        <div>
          <div className="font-bold text-sm tracking-tight text-[var(--tx)]">SmartCool</div>
          <div className="text-[11px] text-[var(--mu)]">Energy-Efficiency Suite</div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#17a673] text-white font-semibold shadow-sm"
                  : "text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--bg)]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-white" : "text-[var(--mu)]"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Controls Section (replicated from reference HTML) */}
      <div className="p-3 border-t border-[var(--bd)] bg-[var(--bg)]/40 space-y-3">
        <div>
          <div className="text-[11px] font-semibold text-[var(--mu)] uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Mode · {selectedRoom.name}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedRoom.occ ? "bg-[var(--ac)]" : "bg-[var(--am)]"
              }`}
            />
          </div>

          {/* AUTO / MANUAL segmented button */}
          <div className="flex bg-[var(--bg)] border border-[var(--bd)] rounded-full p-0.5">
            <button
              onClick={() => setRoomMode(selectedRoomIdx, "auto")}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-full transition-all ${
                currentMode === "auto"
                  ? "bg-[var(--ac)] text-[#04251a] shadow-xs"
                  : "text-[var(--mu)] hover:text-[var(--tx)]"
              }`}
            >
              AUTO
            </button>
            <button
              onClick={() => setRoomMode(selectedRoomIdx, "manual")}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-full transition-all ${
                currentMode === "manual"
                  ? "bg-[var(--ac)] text-[#04251a] shadow-xs"
                  : "text-[var(--mu)] hover:text-[var(--tx)]"
              }`}
            >
              MANUAL
            </button>
          </div>
        </div>

        {/* Quick control buttons */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => toggleRoomMode(selectedRoomIdx)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between border ${
              currentMode === "auto"
                ? "bg-[#17a673]/15 border-[#17a673]/40 text-[#2ee6a0]"
                : "bg-[var(--bg)] border-[var(--bd)] text-[var(--tx)] hover:border-[var(--ac)]"
            }`}
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Mode: {currentMode === "auto" ? "Auto" : "Manual"}</span>
            </span>
            <span className="text-[10px] text-[var(--mu)]">Toggle</span>
          </button>

          <button
            onClick={() => toggleAllAcInRoom(selectedRoomIdx)}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between bg-[var(--bg)] border border-[var(--bd)] text-[var(--tx)] hover:border-[var(--ac)]"
          >
            <span className="flex items-center gap-2">
              <Power className="w-3.5 h-3.5 text-[var(--am)]" />
              <span>All ACs {allOn ? "OFF" : "ON"}</span>
            </span>
            <span className="text-[10px] text-[var(--mu)]">
              {selectedRoom.acs.filter((a) => a.on).length}/{selectedRoom.acs.length} ON
            </span>
          </button>

          <button
            onClick={() => resetRoom(selectedRoomIdx)}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between bg-[var(--bg)] border border-[var(--bd)] text-[var(--mu)] hover:text-[var(--tx)] hover:border-[var(--ac)]"
            title="Set all ACs to Auto and follow the schedule"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset room</span>
            </span>
            <span className="text-[10px] text-[var(--mu)]">Auto</span>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-[var(--bd)] text-[11px] text-[var(--mu)] flex items-center justify-between">
        <span>SmartCool v2.4</span>
        <span className="text-[var(--ac)] font-semibold">Active</span>
      </div>
    </aside>
  );
}
