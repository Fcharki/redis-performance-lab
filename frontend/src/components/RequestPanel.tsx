import { CheckCircle2, Play, ShieldCheck, XCircle } from "lucide-react";

interface RequestPanelProps {
  results: string[];
  testing: boolean;
  onRun: () => void;
}

export default function RequestPanel({
  results,
  testing,
  onRun
}: RequestPanelProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111927] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Rate limiting</h3>
          <p className="mt-1 text-xs text-slate-400">
            10 requests per 60 seconds
          </p>
        </div>
        <ShieldCheck className="text-emerald-400" size={20} />
      </div>

      <p className="mb-5 text-xs leading-6 text-slate-400">
        Send 11 requests to test the Redis-backed fixed-window
        rate limiter.
      </p>

      <button
        onClick={onRun}
        disabled={testing}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50"
      >
        <Play size={16} />
        {testing ? "Testing..." : "Run rate limit test"}
      </button>

      <div className="mt-4 max-h-56 space-y-1 overflow-y-auto">
        {results.map((result, index) => {
          const limited = result.includes("429");

          return (
            <div
              key={index}
              className="flex items-center gap-2 border-b border-slate-800 py-2 text-xs"
            >
              {limited
                ? <XCircle size={15} className="text-red-400" />
                : <CheckCircle2 size={15} className="text-emerald-400" />}
              <span className={limited ? "text-red-400" : "text-slate-300"}>
                {result}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
