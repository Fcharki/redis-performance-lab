import type { ReactNode } from "react";
import { Database, Play, Zap } from "lucide-react";

interface BenchmarkPanelProps {
  loading: boolean;
  benchmarking: boolean;
  onSQLite: () => void;
  onRedis: () => void;
  onBenchmark: () => void;
}

interface ActionProps {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
  disabled: boolean;
}

function Action({
  icon,
  title,
  description,
  color,
  onClick,
  disabled
}: ActionProps) {
  return (
    <div className="flex items-center gap-3 border-t border-slate-800 py-4">
      <div className={`rounded-lg p-3 ${color}`}>
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold">{title}</p>
        <p className="mt-1 text-[10px] text-slate-400">
          {description}
        </p>
      </div>

      <button
        onClick={onClick}
        disabled={disabled}
        className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-semibold hover:bg-slate-600 disabled:opacity-50"
      >
        Test
      </button>
    </div>
  );
}

export default function BenchmarkPanel({
  loading,
  benchmarking,
  onSQLite,
  onRedis,
  onBenchmark
}: BenchmarkPanelProps) {
  const disabled = loading || benchmarking;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111927] p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Cache experiments</h3>
          <p className="mt-1 text-xs text-slate-400">
            Compare database access methods
          </p>
        </div>
        <Zap size={20} className="text-emerald-400" />
      </div>

      <Action
        icon={<Database />}
        title="Direct SQLite"
        description="Bypass Redis completely"
        color="text-amber-400 bg-amber-950"
        onClick={onSQLite}
        disabled={disabled}
      />

      <Action
        icon={<Zap />}
        title="Redis caching"
        description="Check cache before SQLite"
        color="text-emerald-400 bg-emerald-950"
        onClick={onRedis}
        disabled={disabled}
      />

      <button
        onClick={onBenchmark}
        disabled={disabled}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50"
      >
        <Play size={16} />
        Run 20-request benchmark
      </button>
    </div>
  );
}
