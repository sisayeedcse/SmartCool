import { BookOpen } from "lucide-react";

export default function MethodologyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <section className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-navy-900">Methodology & About</h2>
        <p className="text-sm text-slate-500">Engineering prototype and research direction, not a proven commercial solution.</p>
      </section>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="font-semibold text-navy-900">What SmartCool Is</h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          SmartCool is an IoT-inspired energy-efficiency simulation and demonstration platform. It simulates occupancy-aware cooling control strategies and compares them against a conventional baseline using synthetic, reproducible data.
        </p>

        <h3 className="font-semibold text-navy-900">Simulation Methodology</h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          The simulation engine generates deterministic time-series data using a configurable random seed. The same seed and inputs produce identical results, enabling fair strategy comparison. All values are synthetic and clearly labeled throughout the interface.
        </p>

        <h3 className="font-semibold text-navy-900">What Is Not Validated</h3>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>No real ESP32 hardware is connected.</li>
          <li>No real temperature, humidity, or occupancy sensors are used.</li>
          <li>No real AC control or electricity metering is performed.</li>
          <li>Energy savings are estimated from synthetic profiles, not measured.</li>
          <li>CO2-equivalent reductions require a user-configured emissions factor and are estimates only.</li>
        </ul>

        <h3 className="font-semibold text-navy-900">Future Integration Plan</h3>
        <p className="text-sm text-slate-700 leading-relaxed">
          A clean adapter interface is defined so future ESP32 sensors, PIR or mmWave detectors, temperature/humidity probes, and compatible AC interfaces can supply real readings. Physical experiments would then validate simulated assumptions.
        </p>
      </div>
    </main>
  );
}
