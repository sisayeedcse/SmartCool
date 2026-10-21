import Link from "next/link";
import { Activity, Waves, FlaskConical, BarChart3, Scale, FileText, BookOpen, Menu } from "lucide-react";

const nav = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/monitoring", label: "Monitoring", icon: Waves },
  { href: "/lab", label: "Simulation Lab", icon: FlaskConical },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/events", label: "Events", icon: FileText },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];

export default function Sidebar() {
  return (
    <aside className="w-72 shrink-0 bg-navy-900 text-white h-screen sticky top-0 overflow-y-auto hidden md:flex flex-col border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">SmartCool</h1>
        <p className="text-xs text-teal-400 mt-1">Simulation Platform</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors text-slate-200 hover:text-white">
            <item.icon className="w-4 h-4 text-teal-400" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 text-[11px] text-slate-400">
        <p>Simulation-only MVP</p>
        <p>All results are synthetic.</p>
      </div>
    </aside>
  );
}
