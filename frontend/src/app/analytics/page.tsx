import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <section className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Energy Analytics</h2>
        <p className="text-sm text-slate-500">Baseline versus SmartCool comparison with clear assumption labeling.</p>
      </section>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-navy-900">Energy Consumption</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-600">Baseline AC Energy</span><span className="font-semibold">14.2 kWh</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-600">SmartCool AC Energy</span><span className="font-semibold">10.8 kWh</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-600">Controller Overhead</span><span className="font-semibold">0.8 kWh</span></div>
            <div className="border-t border-slate-100 pt-2 flex items-center justify-between"><span className="text-slate-800 font-medium">Net Savings</span><span className="font-bold text-emerald-700">2.6 kWh (18.4%)</span></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-navy-900">Assumptions & Limitations</h3>
          <ul className="text-sm text-slate-600 space-y-2">
            <li>• AC power profile is fixed at 2.5 kW (ON) for this simulation.</li>
            <li>• Real AC power varies with ambient temperature, load, and age.</li>
            <li>• Energy estimates are synthetic; no real measurement performed.</li>
            <li>• Emissions estimates require a configured factor. Not set.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
