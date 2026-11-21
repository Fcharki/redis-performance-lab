import {
  Activity,
  Database,
  Zap,
  Gauge,
  XCircle,
  Server,
  Clock
} from "lucide-react";

import DashboardHeader from "./components/DashboardHeader";
import MetricCard from "./components/MetricCard";
import PerformanceChart from "./components/PerformanceChart";
import BenchmarkPanel from "./components/BenchmarkPanel";
import ProductsPreview from "./components/ProductsPreview";
import RequestPanel from "./components/RequestPanel";

import { useBenchmark } from "./hooks/useBenchmark";
import { useRateLimit } from "./hooks/useRateLimit";

function App() {
  const {
    products,
    sqliteTime,
    redisTime,
    hits,
    misses,
    loading,
    benchmarking,
    error,
    chartData,
    hitRatio,
    speedImprovement,
    handleSQLite,
    handleRedis,
    runBenchmark
  } = useBenchmark();

  const {
    results: rateResults,
    testing: rateTesting,
    run: runRateLimitTest
  } = useRateLimit();

  const formatTime = (value: number | null) =>
    value === null ? "--" : `${value.toFixed(2)} ms`;

  return (
    <main className="min-h-screen bg-[#090d16] text-gray-200">
      <div className="mx-auto max-w-[1440px] p-5 md:p-8">

        <DashboardHeader
          benchmarking={benchmarking}
          disabled={benchmarking || loading}
          onBenchmark={runBenchmark}
        />

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
            <XCircle size={18} />
            {error}
          </div>
        )}

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="SQLite response"
            value={formatTime(sqliteTime)}
            icon={<Database />}
            description="Direct database query"
          />
          <MetricCard
            title="Redis response"
            value={formatTime(redisTime)}
            icon={<Zap />}
            description="Cached API response"
          />
          <MetricCard
            title="Cache hit ratio"
            value={`${hitRatio.toFixed(1)}%`}
            icon={<Gauge />}
            description={`${hits} hits · ${misses} misses`}
          />
          <MetricCard
            title="Speed improvement"
            value={speedImprovement === null
              ? "--"
              : `${speedImprovement.toFixed(1)}%`}
            icon={<Activity />}
            description="Based on latest measurements"
          />
        </section>

        <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
          <PerformanceChart data={chartData} />

          <BenchmarkPanel
            loading={loading}
            benchmarking={benchmarking}
            onSQLite={handleSQLite}
            onRedis={handleRedis}
            onBenchmark={runBenchmark}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ProductsPreview products={products} />

          <RequestPanel
            results={rateResults}
            testing={rateTesting}
            onRun={runRateLimitTest}
          />
        </section>

        <footer className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
          <Server size={15} />
          Redis Performance Lab
          <span>•</span>
          <Clock size={15} />
          Local development
        </footer>
      </div>
    </main>
  );
}

export default App;
