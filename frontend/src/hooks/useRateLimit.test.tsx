import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { AxiosResponse } from "axios";
import { testRateLimit } from "../services/api";
import { useRateLimit } from "./useRateLimit";

vi.mock("../services/api", () => ({
  testRateLimit: vi.fn()
}));

const mockedTestRateLimit = vi.mocked(testRateLimit);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useRateLimit", () => {
  it("records 10 successes followed by a 429", async () => {
    let calls = 0;

    mockedTestRateLimit.mockImplementation(async () => {
      calls++;

      if (calls > 10) {
        throw { isAxiosError: true, response: { status: 429 } };
      }

      return {} as AxiosResponse;
    });

    const { result } = renderHook(() => useRateLimit());

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.results).toHaveLength(11);
    expect(result.current.results[9]).toBe("Request 10: HTTP 200");
    expect(result.current.results[10]).toBe(
      "Request 11: HTTP 429 - Rate limited"
    );
    expect(result.current.testing).toBe(false);
  });

  it("marks unexpected failures", async () => {
    mockedTestRateLimit.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useRateLimit());

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.results[0]).toBe("Request 1: Failed");
  });
});
