import { FileText } from "lucide-react";

export default function EventsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <section className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Events & Diagnostics</h2>
        <p className="text-sm text-slate-500">State transitions, sensor anomalies, and control decisions.</p>
      </section>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-navy-900">Event Timeline</h3>
        <div className="space-y-3">
          <EventRow time="09:00" reason="Initial state: OCCUPIED" />
          <EventRow time="09:05" reason="Vacancy detected; grace period started (5m)" />
          <EventRow time="09:10" reason="Grace period exceeded; setback applied" />
          <EventRow time="09:25" reason="Setback delay exceeded; shutdown applied" />
          <EventRow time="09:35" reason="Reoccupation detected; restore comfort" />
        </div>
      </div>
    </main>
  );
}

function EventRow({ time, reason }: { time: string; reason: string }) {
  return (
    <div className="flex gap-4 items-start text-sm">
      <span className="text-xs font-medium text-slate-400 w-10">{time}</span>
      <span className="text-slate-800">{reason}</span>
    </div>
  );
}
