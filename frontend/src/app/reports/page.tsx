import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <section className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Reports & Exports</h2>
        <p className="text-sm text-slate-500">Download CSV exports and experiment summaries.</p>
      </section>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-navy-900">Available Exports</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• Time-series readings (CSV)</li>
          <li>• Event history (CSV)</li>
          <li>• Experiment summary with assumptions (JSON / text)</li>
        </ul>
        <p className="text-xs text-slate-400">All exports clearly label synthetic data and document configuration assumptions.</p>
      </div>
    </main>
  );
}
