import { Activity, Play, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  benchmarking: boolean;
  disabled: boolean;
  onBenchmark: () => void;
}

export default function DashboardHeader({
  benchmarking,
  disabled,
  onBenchmark
}: DashboardHeaderProps) {
  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-800 pb-7">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-950 p-3 text-emerald-400">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Redis Lab</h1>
            <p className="text-xs text-slate-400">
              Performance testing dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-800/70 px-4 py-2 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Local environment
        </div>
      </header>

      <section className="flex flex-col justify-between gap-5 py-9 sm:flex-row sm:items-center">
        <div>
          <span className="text-[11px] font-bold tracking-[1.5px] text-emerald-400">
            DEVELOPER TOOLKIT
          </span>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Performance Overview
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Explore caching, response times and rate limiting.
          </p>
        </div>

        <button
          onClick={onBenchmark}
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {benchmarking
            ? <RefreshCw size={17} className="animate-spin" />
            : <Play size={17} />}
          {benchmarking ? "Running..." : "Run benchmark"}
        </button>
      </section>
    </>
  );
}
