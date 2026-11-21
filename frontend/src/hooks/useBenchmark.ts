import { useCallback, useMemo, useState } from "react";
import { fetchRedis, fetchSQLite } from "../services/api";
import type { ChartPoint, Product, RequestMetric } from "../types";

const MAX_METRICS = 100;
const BENCHMARK_REQUESTS = 20;

export function useBenchmark() {
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<RequestMetric[]>([]);

  const [sqliteTime, setSqliteTime] = useState<number | null>(null);
  const [redisTime, setRedisTime] = useState<number | null>(null);

  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);

  const [loading, setLoading] = useState(false);
  const [benchmarking, setBenchmarking] = useState(false);

  const [error, setError] = useState("");

  const addMetric = useCallback(
    (label: string, duration: number, source: string) => {
      setMetrics(previous =>
        [
          ...previous,
          {
            id: Date.now() + Math.random(),
            label,
            duration,
            source,
            timestamp: new Date().toLocaleTimeString()
          }
        ].slice(-MAX_METRICS)
      );
    },
    []
  );

  const handleSQLite = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchSQLite();
      const { duration, data } = response.data;

      setSqliteTime(duration);
      setProducts(data);
      addMetric("SQLite", duration, "sqlite");
    } catch {
      setError("Could not fetch SQLite data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [addMetric]);

  const handleRedis = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchRedis();
      const { duration, data, cache } = response.data;

      setRedisTime(duration);
      setProducts(data);

      if (cache === "HIT") {
        setHits(previous => previous + 1);
      } else {
        setMisses(previous => previous + 1);
      }

      addMetric(
        cache === "HIT" ? "Redis HIT" : "Redis MISS",
        duration,
        "redis"
      );
    } catch {
      setError(
        "Could not fetch Redis data. Check your backend and Redis connection."
      );
    } finally {
      setLoading(false);
    }
  }, [addMetric]);

  const runBenchmark = useCallback(async () => {
    setBenchmarking(true);
    setError("");

    const results: RequestMetric[] = [];

    let benchmarkHits = 0;
    let benchmarkMisses = 0;
    let lastProducts: Product[] = [];

    try {
      for (let i = 0; i < BENCHMARK_REQUESTS; i++) {
        const isRedis = i % 2 === 1;
        const start = performance.now();

        const response = isRedis
          ? await fetchRedis()
          : await fetchSQLite();

        const elapsed = performance.now() - start;
        const data = response.data;

        results.push({
          id: Date.now() + i,
          label: isRedis
            ? data.cache === "HIT"
              ? "Redis HIT"
              : "Redis MISS"
            : "SQLite",
          duration: elapsed,
          source: isRedis ? "redis" : "sqlite",
          timestamp: new Date().toLocaleTimeString()
        });

        if (isRedis) {
          if (data.cache === "HIT") {
            benchmarkHits++;
          } else {
            benchmarkMisses++;
          }
        }

        lastProducts = data.data;
      }

      setMetrics(previous =>
        [...previous, ...results].slice(-MAX_METRICS)
      );

      if (benchmarkHits) {
        setHits(previous => previous + benchmarkHits);
      }

      if (benchmarkMisses) {
        setMisses(previous => previous + benchmarkMisses);
      }

      if (lastProducts.length) {
        setProducts(lastProducts);
      }

      const sqliteResults = results.filter(
        item => item.label === "SQLite"
      );

      const redisResults = results.filter(
        item => item.source === "redis"
      );

      if (sqliteResults.length) {
        setSqliteTime(
          sqliteResults.reduce((sum, item) => sum + item.duration, 0) /
            sqliteResults.length
        );
      }

      if (redisResults.length) {
        setRedisTime(
          redisResults.reduce((sum, item) => sum + item.duration, 0) /
            redisResults.length
        );
      }
    } catch {
      setError("Benchmark failed. Check the backend connection.");
    } finally {
      setBenchmarking(false);
    }
  }, []);

  const speedImprovement = useMemo(() => {
    if (
      sqliteTime === null ||
      redisTime === null ||
      sqliteTime <= 0
    ) {
      return null;
    }

    return ((sqliteTime - redisTime) / sqliteTime) * 100;
  }, [sqliteTime, redisTime]);

  const chartData = useMemo<ChartPoint[]>(
    () =>
      metrics.map((metric, index) => ({
        request: index + 1,
        SQLite: metric.source === "sqlite" ? metric.duration : null,
        Redis: metric.source === "redis" ? metric.duration : null
      })),
    [metrics]
  );

  const totalCacheRequests = hits + misses;
  const hitRatio = totalCacheRequests
    ? (hits / totalCacheRequests) * 100
    : 0;

  return {
    products,
    metrics,
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
  };
}
