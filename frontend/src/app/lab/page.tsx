"use client";
import { FlaskConical } from "lucide-react";

export default function LabPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <section className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Simulation Laboratory</h2>
        <p className="text-sm text-slate-500">Configure scenarios, set seed values, and run reproducible experiments.</p>
      </section>
      <form className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Simulation started (synthetic). In production, this calls POST /api/simulations/{id}/start."); }}>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="seed" className="block text-xs font-medium text-slate-600 mb-1">Random Seed</label>
            <input id="seed" type="number" defaultValue={42} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30" />
          </div>
          <div>
            <label htmlFor="duration" className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
            <input id="duration" type="number" defaultValue={60} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30" />
          </div>
          <div>
            <label htmlFor="scenario" className="block text-xs font-medium text-slate-600 mb-1">Scenario</label>
            <select id="scenario" defaultValue="smartcool" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30">
              <option>SmartCool Vacancy Confirmation</option>
              <option>Basic Occupancy Control</option>
              <option>Sensor Uncertainty</option>
              <option>Sensor Fault Handling</option>
            </select>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-sm">
          <h4 className="font-medium text-slate-800">Configuration Assumptions</h4>
          <ul className="list-disc pl-4 text-slate-600 space-y-1">
            <li>Comfort setpoint: 24 °C</li>
            <li>Setback setpoint: 28 °C</li>
            <li>Vacancy grace period: 5 min</li>
            <li>Shutdown delay: 15 min</li>
            <li>Sensor false-negative rate: 5%</li>
          </ul>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-navy-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors">Start Simulation</button>
          <button type="button" onClick={() => alert("Reset requires admin token. See .env.example.")} className="border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Reset</button>
        </div>
      </form>
    </main>
  );
}
