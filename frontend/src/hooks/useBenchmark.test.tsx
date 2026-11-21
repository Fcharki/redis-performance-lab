import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { AxiosResponse } from "axios";
import { fetchRedis, fetchSQLite } from "../services/api";
import type { Product, ProductsResponse } from "../types";
import { useBenchmark } from "./useBenchmark";

vi.mock("../services/api", () => ({
  fetchSQLite: vi.fn(),
  fetchRedis: vi.fn()
}));

const mockedFetchSQLite = vi.mocked(fetchSQLite);
const mockedFetchRedis = vi.mocked(fetchRedis);

const products: Product[] = [
  { id: 1, name: "Product 1", price: 9.99, category: "Books" }
];

function sqliteResponse(duration = 10): AxiosResponse<ProductsResponse> {
  return {
    data: { source: "sqlite", duration, data: products }
  } as unknown as AxiosResponse<ProductsResponse>;
}

function redisResponse(
  cache: "HIT" | "MISS",
  duration = 2
): AxiosResponse<ProductsResponse> {
  return {
    data: {
      source: cache === "HIT" ? "redis" : "sqlite",
      cache,
      duration,
      data: products
    }
  } as unknown as AxiosResponse<ProductsResponse>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedFetchSQLite.mockResolvedValue(sqliteResponse());
  mockedFetchRedis.mockResolvedValue(redisResponse("HIT"));
});

describe("useBenchmark", () => {
  it("starts with empty state", () => {
    const { result } = renderHook(() => useBenchmark());

    expect(result.current.products).toEqual([]);
    expect(result.current.metrics).toEqual([]);
    expect(result.current.sqliteTime).toBeNull();
    expect(result.current.redisTime).toBeNull();
    expect(result.current.hitRatio).toBe(0);
    expect(result.current.speedImprovement).toBeNull();
    expect(result.current.chartData).toEqual([]);
  });

  it("loads SQLite products and records a metric", async () => {
    const { result } = renderHook(() => useBenchmark());

    await act(async () => {
      await result.current.handleSQLite();
    });

    expect(result.current.products).toEqual(products);
    expect(result.current.sqliteTime).toBe(10);
    expect(result.current.metrics).toHaveLength(1);
    expect(result.current.metrics[0]).toMatchObject({
      label: "SQLite",
      duration: 10,
      source: "sqlite"
    });
    expect(result.current.loading).toBe(false);
  });

  it("records a Redis cache hit", async () => {
    const { result } = renderHook(() => useBenchmark());

    await act(async () => {
      await result.current.handleRedis();
    });

    expect(result.current.hits).toBe(1);
    expect(result.current.misses).toBe(0);
    expect(result.current.hitRatio).toBe(100);
    expect(result.current.metrics[0]).toMatchObject({
      label: "Redis HIT",
      source: "redis"
    });
  });

  it("records a Redis cache miss", async () => {
    mockedFetchRedis.mockResolvedValue(redisResponse("MISS"));

    const { result } = renderHook(() => useBenchmark());

    await act(async () => {
      await result.current.handleRedis();
    });

    expect(result.current.hits).toBe(0);
    expect(result.current.misses).toBe(1);
    expect(result.current.metrics[0]).toMatchObject({
      label: "Redis MISS",
      source: "redis"
    });
  });

  it("builds chart data and speed improvement from measurements", async () => {
    const { result } = renderHook(() => useBenchmark());

    await act(async () => {
      await result.current.handleSQLite();
    });

    await act(async () => {
      await result.current.handleRedis();
    });

    expect(result.current.chartData).toEqual([
      { request: 1, SQLite: 10, Redis: null },
      { request: 2, SQLite: null, Redis: 2 }
    ]);
    expect(result.current.speedImprovement).toBe(80);
  });

  it("sets an error when SQLite fails", async () => {
    mockedFetchSQLite.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useBenchmark());

    await act(async () => {
      await result.current.handleSQLite();
    });

    expect(result.current.error).toBe(
      "Could not fetch SQLite data. Is the backend running?"
    );
    expect(result.current.loading).toBe(false);
  });

  it("runs a 20 request benchmark alternating endpoints", async () => {
    const { result } = renderHook(() => useBenchmark());

    await act(async () => {
      await result.current.runBenchmark();
    });

    expect(mockedFetchSQLite).toHaveBeenCalledTimes(10);
    expect(mockedFetchRedis).toHaveBeenCalledTimes(10);
    expect(result.current.metrics).toHaveLength(20);
    expect(result.current.hits).toBe(10);
    expect(result.current.misses).toBe(0);
    expect(result.current.sqliteTime).not.toBeNull();
    expect(result.current.redisTime).not.toBeNull();
    expect(result.current.chartData).toHaveLength(20);
    expect(result.current.benchmarking).toBe(false);
  });
});
