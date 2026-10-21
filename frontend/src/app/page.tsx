import { Thermometer, Droplets, Zap, TrendingDown, Clock, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <section className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Overview</h2>
        <p className="text-slate-500 text-sm">Simulation-only dashboard for research demonstration. All data is synthetic.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Temperature" value="26.3 °C" icon={<Thermometer className="w-5 h-5 text-teal-500" />} label="Simulated" />
        <Card title="Humidity" value="58 %" icon={<Droplets className="w-5 h-5 text-teal-500" />} label="Simulated" />
        <Card title="AC Power" value="2.5 kW" icon={<Zap className="w-5 h-5 text-teal-500" />} label="Est. profile" />
        <Card title="Savings" value="18.4 %" icon={<TrendingDown className="w-5 h-5 text-teal-500" />} label="Estimated" />
      </div>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">Energy Performance</h3>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Synthetic results</span>
          </div>
          <div className="space-y-3">
            <MetricRow label="Baseline Energy" value="14.2 kWh" />
            <MetricRow label="SmartCool Energy" value="11.6 kWh" />
            <MetricRow label="Net Savings" value="2.6 kWh" accent={true} />
            <MetricRow label="Bill Savings (est.)" value="22.10 BDT" />
            <MetricRow label="Emissions Factor" value="Not configured" muted={true} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-navy-900">System Status</h3>
          <StatusRow icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} label="Simulation Engine" value="Active" />
          <StatusRow icon={<ShieldAlert className="w-4 h-4 text-amber-500" />} label="Sensor Health" value="OK (simulated)" />
          <StatusRow icon={<Clock className="w-4 h-4 text-blue-500" />} label="Current State" value="OCCUPIED" />
          <StatusRow icon={<Zap className="w-4 h-4 text-rose-500" />} label="Emissions Report" value="Unavailable" muted={true} />
        </div>
      </section>
    </main>
  );
}

function Card({ title, value, icon, label }: { title: string; value: string; icon: React.ReactNode; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-slate-500">{title}</h4>
        {icon}
      </div>
      <div className="text-2xl font-bold text-navy-900">{value}</div>
      <div className="text-[11px] text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function MetricRow({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-slate-400" : "text-slate-600"}>{label}</span>
      <span className={`font-semibold ${accent ? "text-emerald-700" : muted ? "text-slate-400" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

function StatusRow({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{icon}</span>
      <span className={`flex-1 ${muted ? "text-slate-400" : "text-slate-600"}`}>{label}</span>
      <span className={`text-xs font-medium ${muted ? "text-slate-400" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}
