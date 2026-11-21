import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  all: vi.fn(),
  prepare: vi.fn(),
  get: vi.fn(),
  set: vi.fn()
}));

vi.mock("../config/db", () => ({
  default: { prepare: mocks.prepare }
}));

vi.mock("../config/redis", () => ({
  default: { get: mocks.get, set: mocks.set }
}));

import app from "../app";

const products = [
  { id: 1, name: "Product 1", price: 9.99, category: "Books" }
];

beforeEach(() => {
  vi.clearAllMocks();

  mocks.prepare.mockReturnValue({ all: mocks.all });
  mocks.all.mockReturnValue(products);
  mocks.get.mockResolvedValue(null);
  mocks.set.mockResolvedValue("OK");
});

describe("GET /api/products", () => {
  it("returns products directly from SQLite", async () => {
    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.source).toBe("sqlite");
    expect(response.body.data).toEqual(products);
    expect(typeof response.body.duration).toBe("number");
    expect(mocks.prepare).toHaveBeenCalledWith(
      "SELECT * FROM products LIMIT 100"
    );
  });
});

describe("GET /api/products/cached", () => {
  it("returns cached products on a Redis hit", async () => {
    mocks.get.mockResolvedValue(JSON.stringify(products));

    const response = await request(app).get("/api/products/cached");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      source: "redis",
      cache: "HIT",
      data: products
    });
    expect(mocks.get).toHaveBeenCalledWith("products:all");
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("queries SQLite and populates Redis on a cache miss", async () => {
    const response = await request(app).get("/api/products/cached");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      source: "sqlite",
      cache: "MISS",
      data: products
    });
    expect(mocks.set).toHaveBeenCalledWith(
      "products:all",
      JSON.stringify(products),
      { EX: 60 }
    );
  });
});
