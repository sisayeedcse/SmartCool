"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

export const T0 = 540; // 9:00 AM in minutes
export const TE = 900; // 3:00 PM in minutes

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const formatNum = (n: number, d = 2) => Number(n).toFixed(d);

export const format12h = (h: number) => (h > 12 ? h - 12 : h === 0 ? 12 : h);
export const formatTimeStr = (t: number) => {
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${String(format12h(h)).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
export const formatTimeShort = (t: number) => {
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${format12h(h)}:${String(m).padStart(2, "0")}`;
};
export const formatDuration = (m: number) => {
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return `${hours} h ${String(mins).padStart(2, "0")} min`;
};

export const SCHEDULES: Record<string, number[][]> = {
  A: [[540, 585], [600, 645], [660, 705], [735, 780]],
  B: [[540, 585], [660, 705], [735, 780]],
  C: [[600, 645], [660, 705], [735, 780]],
  D: [[540, 585], [600, 645], [735, 780]],
};

export const SCHEDULE_NAMES: Record<string, string> = {
  A: "4 lectures (9:00, 10:00, 11:00, 12:15)",
  B: "3 lectures (no 10:00)",
  C: "3 lectures (no 9:00)",
  D: "3 lectures (no 11:00)",
};

export interface AcUnit {
  n: string;
  on: boolean;
  mode: "auto" | "manual";
  p: number; // kW
}

export interface HistoryPoint {
  t: number;
  a: number; // smart temp
  b: number; // normal temp
  e: number; // smart cumulative kWh
  en: number; // normal cumulative kWh
}

export interface Room {
  id: string;
  name: string;
  sk: string; // schedule key 'A' | 'B' | 'C' | 'D'
  occ: boolean;
  force: boolean | null; // null: schedule, true: force occ, false: force vacant
  vac: number; // vacancy timer in min
  temp: number; // smart temp
  tn: number; // normal temp
  e: number; // smart energy kWh
  en: number; // normal energy kWh
  run: number; // runtime minutes AC on
  h: HistoryPoint[];
  acs: AcUnit[];
}

export interface SimulationSettings {
  tariff: number; // BDT / kWh
  ef: number; // kg CO2e / kWh
  vac: number; // vacancy timeout min
  set: number; // temp setpoint C
  ms: number; // speed ms/min
}

export interface EventLogEntry {
  id: string;
  t: number;
  room: string;
  m: string;
  ty: "on" | "off" | "info";
}

interface RoomMetrics {
  sv: number; // kWh saved
  pct: number; // % saved
  cost: number; // smart cost BDT
  co2: number; // smart CO2 kg
  cn: number; // normal cost BDT
  on: number; // normal CO2 kg
}

interface SimulationContextType {
  t: number;
  isDayComplete: boolean;
  isRunning: boolean;
  setIsRunning: (run: boolean | ((prev: boolean) => boolean)) => void;
  selectedRoomIdx: number;
  setSelectedRoomIdx: (i: number) => void;
  rooms: Room[];
  selectedRoom: Room;
  settings: SimulationSettings;
  updateSetting: <K extends keyof SimulationSettings>(k: K, val: SimulationSettings[K]) => void;
  events: EventLogEntry[];
  theme: "dark" | "light";
  toggleTheme: () => void;
  toggleAcPower: (roomIdx: number, acIdx: number) => void;
  toggleAcMode: (roomIdx: number, acIdx: number) => void;
  setRoomMode: (roomIdx: number, mode: "auto" | "manual") => void;
  toggleRoomMode: (roomIdx: number) => void;
  toggleAllAcInRoom: (roomIdx: number) => void;
  setRoomForce: (roomIdx: number, force: boolean | null) => void;
  resetRoom: (roomIdx: number) => void;
  restartDay: () => void;
  addRoom: (name: string, acCount: number, scheduleKey: string) => boolean;
  removeRoom: (idx: number) => void;
  getRoomMetrics: (r: Room) => RoomMetrics;
  getRoomPower: (r: Room) => number;
  getRoomMode: (r: Room) => "auto" | "manual";
  // Global aggregate metrics
  totalRooms: number;
  occupiedRooms: number;
  totalAcs: number;
  onAcs: number;
  totalPowerKw: number;
  totalSmartEnergyKwh: number;
  totalNormalEnergyKwh: number;
  totalSavedEnergyKwh: number;
  savingsPercent: number;
  totalSmartCostBdt: number;
  totalSavedCostBdt: number;
  totalSmartCo2Kg: number;
  totalSavedCo2Kg: number;
}

const DEFAULT_SETTINGS: SimulationSettings = {
  tariff: 10,
  ef: 0.696,
  vac: 5,
  set: 24,
  ms: 1500,
};

function createInitialRoom(id: string, name: string, nAcs: number, sk: string, targetTime: number, settings: SimulationSettings, logEvent: (entry: EventLogEntry) => void): Room {
  const r: Room = {
    id,
    name,
    sk,
    occ: false,
    force: null,
    vac: 0,
    temp: 30,
    tn: 30,
    e: 0,
    en: 0,
    run: 0,
    h: [],
    acs: [],
  };

  for (let i = 1; i <= nAcs; i++) {
    r.acs.push({ n: `AC-${i}`, on: false, mode: "auto", p: 0 });
  }

  // Pre-simulate from T0 up to targetTime
  for (let minute = T0; minute < targetTime; minute++) {
    stepRoom(r, minute, settings, logEvent);
  }

  return r;
}

function stepRoom(r: Room, currentMin: number, settings: SimulationSettings, logEvent: (entry: EventLogEntry) => void) {
  const was = r.occ;
  const schedule = SCHEDULES[r.sk] || SCHEDULES.A;
  const n = r.force != null ? r.force : schedule.some(([a, b]) => currentMin >= a && currentMin < b);
  r.occ = n;
  r.vac = n ? 0 : r.vac + 1;

  let turnedOnCount = 0;
  r.acs.forEach((a) => {
    if (a.mode === "auto") {
      if (n && !a.on) {
        a.on = true;
        turnedOnCount++;
        logEvent({
          id: `${currentMin}-${r.id}-${a.n}-on`,
          t: currentMin,
          room: r.name,
          m: `Motion detected → ${a.n} turned ON (Auto mode)`,
          ty: "on",
        });
      } else if (!n && a.on && r.vac >= settings.vac) {
        a.on = false;
        logEvent({
          id: `${currentMin}-${r.id}-${a.n}-off`,
          t: currentMin,
          room: r.name,
          m: `${a.n} turned OFF (${settings.vac} min vacancy reached)`,
          ty: "off",
        });
      }
    }
  });

  if (n && !was && !turnedOnCount && r.acs.some((a) => a.on)) {
    logEvent({
      id: `${currentMin}-${r.id}-already-on`,
      t: currentMin,
      room: r.name,
      m: `Motion detected → AC already ON (Auto mode)`,
      ty: "on",
    });
  }
  if (!n && was) {
    logEvent({
      id: `${currentMin}-${r.id}-empty`,
      t: currentMin,
      room: r.name,
      m: `Room became empty → Vacancy timer started`,
      ty: "info",
    });
  }

  const k = r.acs.filter((a) => a.on).length;
  const N = r.acs.length;

  r.acs.forEach((a) => {
    a.p = a.on
      ? clamp(0.8 + (r.temp - settings.set) * 0.1 + 0.05 * Math.sin(currentMin * 1.7 + a.n.length), 0.8, 1.4)
      : 0;
  });

  r.temp += k
    ? (settings.set - 0.6 - r.temp) * 0.05 * (k / N) + 0.04 * Math.sin(currentMin / 3)
    : ((n ? 31 : 30.5) - r.temp) * 0.02;

  r.tn += (settings.set - 0.6 - r.tn) * 0.05 + 0.04 * Math.sin(currentMin / 4 + 1);

  const smartPowerTotal = r.acs.reduce((s, a) => s + a.p, 0);
  r.e += smartPowerTotal / 60;

  const normalPowerPerAc = clamp(0.8 + (r.tn - settings.set) * 0.1 + 0.05 * Math.sin(currentMin * 1.3), 0.8, 1.4);
  r.en += (N * normalPowerPerAc) / 60;

  if (k > 0) r.run++;

  r.h.push({
    t: currentMin,
    a: Number(r.temp.toFixed(2)),
    b: Number(r.tn.toFixed(2)),
    e: Number(r.e.toFixed(3)),
    en: Number(r.en.toFixed(3)),
  });
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState<number>(684); // 11:24 AM
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [selectedRoomIdx, setSelectedRoomIdx] = useState<number>(0);
  const [settings, setSettings] = useState<SimulationSettings>(DEFAULT_SETTINGS);
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const eventsRef = useRef<EventLogEntry[]>([]);
  const logEvent = useCallback((entry: EventLogEntry) => {
    eventsRef.current = [entry, ...eventsRef.current].slice(0, 300);
    setEvents(eventsRef.current);
  }, []);

  const [rooms, setRooms] = useState<Room[]>(() => {
    const initialEvents: EventLogEntry[] = [];
    const collector = (e: EventLogEntry) => {
      initialEvents.unshift(e);
    };
    const rList = [
      createInitialRoom("rm-101", "Room 101", 2, "A", 684, DEFAULT_SETTINGS, collector),
      createInitialRoom("rm-102", "Room 102", 1, "B", 684, DEFAULT_SETTINGS, collector),
      createInitialRoom("rm-201", "Computer Lab 201", 3, "C", 684, DEFAULT_SETTINGS, collector),
      createInitialRoom("rm-301", "Seminar Hall 301", 2, "D", 684, DEFAULT_SETTINGS, collector),
    ];
    eventsRef.current = initialEvents.slice(0, 300);
    return rList;
  });

  // Keep state sync with theme on document
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Tick simulation loop
  useEffect(() => {
    if (!isRunning || t >= TE) return;

    const timer = setTimeout(() => {
      setT((prevT) => {
        if (prevT >= TE) return prevT;
        const nextT = prevT + 1;
        setRooms((prevRooms) =>
          prevRooms.map((r) => {
            const clone: Room = {
              ...r,
              acs: r.acs.map((a) => ({ ...a })),
              h: [...r.h],
            };
            stepRoom(clone, prevT, settings, logEvent);
            return clone;
          })
        );
        return nextT;
      });
    }, settings.ms);

    return () => clearTimeout(timer);
  }, [isRunning, t, settings, logEvent]);

  const updateSetting = useCallback(<K extends keyof SimulationSettings>(k: K, val: SimulationSettings[K]) => {
    setSettings((prev) => ({ ...prev, [k]: val }));
  }, []);

  const toggleAcPower = useCallback((roomIdx: number, acIdx: number) => {
    setRooms((prev) => {
      return prev.map((r, ri) => {
        if (ri !== roomIdx) return r;
        const acs = r.acs.map((a, ai) => {
          if (ai !== acIdx) return a;
          const nextOn = !a.on;
          logEvent({
            id: `${Date.now()}-${r.id}-${a.n}-toggle`,
            t,
            room: r.name,
            m: `${a.n} turned ${nextOn ? "ON" : "OFF"} manually`,
            ty: nextOn ? "on" : "off",
          });
          return { ...a, on: nextOn, mode: "manual" as const };
        });
        return { ...r, acs };
      });
    });
  }, [t, logEvent]);

  const toggleAcMode = useCallback((roomIdx: number, acIdx: number) => {
    setRooms((prev) => {
      return prev.map((r, ri) => {
        if (ri !== roomIdx) return r;
        const acs = r.acs.map((a, ai) => {
          if (ai !== acIdx) return a;
          const nextMode: "auto" | "manual" = a.mode === "auto" ? "manual" : "auto";
          return { ...a, mode: nextMode };
        });
        return { ...r, acs };
      });
    });
  }, []);

  const setRoomMode = useCallback((roomIdx: number, mode: "auto" | "manual") => {
    setRooms((prev) => {
      return prev.map((r, ri) => {
        if (ri !== roomIdx) return r;
        return {
          ...r,
          acs: r.acs.map((a) => ({ ...a, mode })),
        };
      });
    });
  }, []);

  const toggleRoomMode = useCallback((roomIdx: number) => {
    setRooms((prev) => {
      return prev.map((r, ri) => {
        if (ri !== roomIdx) return r;
        const isCurrentlyAuto = r.acs.every((a) => a.mode === "auto");
        const nextMode = isCurrentlyAuto ? "manual" : "auto";
        return {
          ...r,
          acs: r.acs.map((a) => ({ ...a, mode: nextMode })),
        };
      });
    });
  }, []);

  const toggleAllAcInRoom = useCallback((roomIdx: number) => {
    setRooms((prev) => {
      return prev.map((r, ri) => {
        if (ri !== roomIdx) return r;
        const allOn = r.acs.every((a) => a.on);
        const targetOn = !allOn;
        r.acs.forEach((a) => {
          if (a.on !== targetOn) {
            logEvent({
              id: `${Date.now()}-${r.id}-${a.n}-all`,
              t,
              room: r.name,
              m: `${a.n} turned ${targetOn ? "ON" : "OFF"} manually`,
              ty: targetOn ? "on" : "off",
            });
          }
        });
        return {
          ...r,
          acs: r.acs.map((a) => ({ ...a, on: targetOn, mode: "manual" })),
        };
      });
    });
  }, [t, logEvent]);

  const setRoomForce = useCallback((roomIdx: number, force: boolean | null) => {
    setRooms((prev) => {
      return prev.map((r, ri) => {
        if (ri !== roomIdx) return r;
        return { ...r, force };
      });
    });
  }, []);

  const resetRoom = useCallback((roomIdx: number) => {
    setRooms((prev) => {
      return prev.map((r, ri) => {
        if (ri !== roomIdx) return r;
        return {
          ...r,
          force: null,
          acs: r.acs.map((a) => ({ ...a, mode: "auto" })),
        };
      });
    });
  }, []);

  const restartDay = useCallback(() => {
    const collector = (e: EventLogEntry) => {
      eventsRef.current.unshift(e);
    };
    eventsRef.current = [];
    setT(T0);
    setIsRunning(true);
    setRooms((prev) =>
      prev.map((r) => {
        const fresh: Room = {
          ...r,
          occ: false,
          force: null,
          vac: 0,
          temp: 30,
          tn: 30,
          e: 0,
          en: 0,
          run: 0,
          h: [],
          acs: r.acs.map((a) => ({ ...a, on: false, mode: "auto", p: 0 })),
        };
        return fresh;
      })
    );
    setEvents([]);
  }, []);

  const addRoom = useCallback((name: string, acCount: number, scheduleKey: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed || acCount < 1 || acCount > 6) return false;
    setRooms((prev) => {
      if (prev.some((r) => r.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      const collector = (e: EventLogEntry) => {
        eventsRef.current.unshift(e);
      };
      const newRoom = createInitialRoom(
        `rm-${Date.now()}`,
        trimmed,
        Math.round(acCount),
        scheduleKey,
        t,
        settings,
        collector
      );
      return [...prev, newRoom];
    });
    return true;
  }, [t, settings]);

  const removeRoom = useCallback((idx: number) => {
    setRooms((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((_, i) => i !== idx);
      setSelectedRoomIdx((curr) => Math.min(curr, filtered.length - 1));
      return filtered;
    });
  }, []);

  const getRoomMetrics = useCallback((r: Room): RoomMetrics => {
    const sv = r.en - r.e;
    const pct = r.en > 0 ? (100 * sv) / r.en : 0;
    const cost = r.e * settings.tariff;
    const co2 = r.e * settings.ef;
    const cn = r.en * settings.tariff;
    const on = r.en * settings.ef;
    return { sv, pct, cost, co2, cn, on };
  }, [settings]);

  const getRoomPower = useCallback((r: Room): number => {
    return r.acs.reduce((s, a) => s + a.p, 0);
  }, []);

  const getRoomMode = useCallback((r: Room): "auto" | "manual" => {
    return r.acs.every((a) => a.mode === "auto") ? "auto" : "manual";
  }, []);

  const selectedRoom = rooms[selectedRoomIdx] || rooms[0];

  // Aggregates
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.occ).length;
  const totalAcs = rooms.reduce((s, r) => s + r.acs.length, 0);
  const onAcs = rooms.reduce((s, r) => s + r.acs.filter((a) => a.on).length, 0);
  const totalPowerKw = rooms.reduce((s, r) => s + getRoomPower(r), 0);
  const totalSmartEnergyKwh = rooms.reduce((s, r) => s + r.e, 0);
  const totalNormalEnergyKwh = rooms.reduce((s, r) => s + r.en, 0);
  const totalSavedEnergyKwh = totalNormalEnergyKwh - totalSmartEnergyKwh;
  const savingsPercent = totalNormalEnergyKwh > 0 ? (100 * totalSavedEnergyKwh) / totalNormalEnergyKwh : 0;
  const totalSmartCostBdt = totalSmartEnergyKwh * settings.tariff;
  const totalSavedCostBdt = totalSavedEnergyKwh * settings.tariff;
  const totalSmartCo2Kg = totalSmartEnergyKwh * settings.ef;
  const totalSavedCo2Kg = totalSavedEnergyKwh * settings.ef;

  return (
    <SimulationContext.Provider
      value={{
        t,
        isDayComplete: t >= TE,
        isRunning,
        setIsRunning,
        selectedRoomIdx,
        setSelectedRoomIdx,
        rooms,
        selectedRoom,
        settings,
        updateSetting,
        events,
        theme,
        toggleTheme,
        toggleAcPower,
        toggleAcMode,
        setRoomMode,
        toggleRoomMode,
        toggleAllAcInRoom,
        setRoomForce,
        resetRoom,
        restartDay,
        addRoom,
        removeRoom,
        getRoomMetrics,
        getRoomPower,
        getRoomMode,
        totalRooms,
        occupiedRooms,
        totalAcs,
        onAcs,
        totalPowerKw,
        totalSmartEnergyKwh,
        totalNormalEnergyKwh,
        totalSavedEnergyKwh,
        savingsPercent,
        totalSmartCostBdt,
        totalSavedCostBdt,
        totalSmartCo2Kg,
        totalSavedCo2Kg,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}
