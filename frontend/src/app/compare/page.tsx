import { Scale } from "lucide-react";

export default function ComparePage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <section className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Experiment Comparison</h2>
        <p className="text-sm text-slate-500">Compare saved runs with identical underlying inputs for fair evaluation.</p>
      </section>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
        <p className="font-semibold">Fair Comparison Notice</p>
        <p>Only compare runs with the same scenario inputs, duration, and seed. Changing occupancy schedules or sensor error rates between runs makes comparison unfair.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-navy-900">Saved Experiments</h3>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
            <tr><th className="px-3 py-2">Name</th><th>Seed</th><th>Duration</th><th>Strategy</th><th>Energy</th><th>Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr><td className="px-3 py-3">Baseline Room A</td><td>42</td><td>60m</td><td>Baseline</td><td>14.2 kWh</td><td><span className="text-teal-600 font-medium">Compare</span></td></tr>
            <tr><td className="px-3 py-3">SmartCool Room A</td><td>42</td><td>60m</td><td>SmartCool</td><td>11.6 kWh</td><td><span className="text-teal-600 font-medium">Compare</span></td></tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
