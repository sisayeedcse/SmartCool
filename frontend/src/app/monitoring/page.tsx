import { Waves } from "lucide-react";

export default function MonitoringPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <section className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Room Monitoring</h2>
        <p className="text-sm text-slate-500">Simulated sensor readings and control events for demonstration.</p>
      </section>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
          <Waves className="w-4 h-4" /> Simulation Badge — Not Physical Sensors
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs text-slate-400 mb-1">Occupancy</div>
            <div className="text-xl font-semibold text-emerald-700">Occupied</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs text-slate-400 mb-1">Temperature</div>
            <div className="text-xl font-semibold text-navy-900">26.3 °C</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs text-slate-400 mb-1">Humidity</div>
            <div className="text-xl font-semibold text-navy-900">58 %</div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Important Note</p>
          <p>This page displays simulated readings only. No physical ESP32, temperature/humidity sensor, or PIR sensor is connected. Future hardware integration will require a separate adapter interface.</p>
        </div>
      </div>
    </main>
  );
}
