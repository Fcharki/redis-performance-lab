import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Activity } from "lucide-react";
import type { ChartPoint } from "../types";

interface PerformanceChartProps {
  data: ChartPoint[];
}

export default function PerformanceChart({
  data
}: PerformanceChartProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111927] p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Response time comparison
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Individual request latency
          </p>
        </div>
        <Activity className="text-emerald-400" size={20} />
      </div>

      <div className="h-[270px]">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#273449"
                vertical={false}
              />
              <XAxis
                dataKey="request"
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis stroke="#64748b" fontSize={11} unit=" ms" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111927",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0"
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="SQLite"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.12}
              />
              <Area
                type="monotone"
                dataKey="Redis"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.12}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-sm text-slate-500">
            <Activity size={32} className="mb-3" />
            Run requests to see performance data.
          </div>
        )}
      </div>
    </div>
  );
}
