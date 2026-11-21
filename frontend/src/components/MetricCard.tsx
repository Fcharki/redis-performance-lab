import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  description
}: MetricCardProps) {
  return (
    <div className="min-h-[140px] rounded-xl border border-slate-800 bg-[#111927] p-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        {title}
        <span className="text-emerald-400">{icon}</span>
      </div>

      <strong className="mt-5 block text-2xl font-bold">
        {value}
      </strong>

      <p className="mt-2 text-[11px] text-slate-500">
        {description}
      </p>
    </div>
  );
}
