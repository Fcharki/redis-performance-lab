import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const redisMock = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn()
}));

vi.mock("../config/redis", () => ({
  default: redisMock
}));

import { rateLimiter } from "./rateLimiter";

function createApp() {
  const app = express();

  app.get("/limited", rateLimiter, (_req, res) => {
    res.json({ message: "Request successful!" });
  });

  return app;
}

beforeEach(() => {
  vi.clearAllMocks();

  let count = 0;
  redisMock.incr.mockImplementation(async () => ++count);
  redisMock.expire.mockResolvedValue(1);
});

describe("rateLimiter", () => {
  it("allows ten requests and rejects the eleventh", async () => {
    const app = createApp();

    for (let i = 0; i < 10; i++) {
      const response = await request(app).get("/limited");

      expect(response.status).toBe(200);
      expect(response.headers["x-ratelimit-limit"]).toBe("10");
      expect(response.headers["x-ratelimit-remaining"]).toBe(
        String(9 - i)
      );
    }

    const blocked = await request(app).get("/limited");

    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toBe(
      "Too many requests. Try again later."
    );
  });

  it("sets the expiry on the first request only", async () => {
    const app = createApp();

    await request(app).get("/limited");
    await request(app).get("/limited");

    expect(redisMock.expire).toHaveBeenCalledTimes(1);
    expect(redisMock.expire).toHaveBeenCalledWith(
      expect.stringContaining("rate-limit:"),
      60
    );
  });

  it("returns 500 when Redis is unavailable", async () => {
    redisMock.incr.mockRejectedValue(new Error("connection refused"));

    const app = createApp();
    const response = await request(app).get("/limited");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Rate limiter unavailable");
  });
});
