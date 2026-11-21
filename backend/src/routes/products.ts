
import { Router } from "express";
import db from "../config/db";
import redis from "../config/redis";

const router = Router();

// WITHOUT REDIS
router.get("/", (req, res) => {
  const start = performance.now();

  const products = db.prepare(
    "SELECT * FROM products LIMIT 100"
  ).all();

  const duration = performance.now() - start;

  res.json({
    source: "sqlite",
    duration: Number(duration.toFixed(3)),
    data: products
  });
});

// WITH REDIS
router.get("/cached", async (req, res) => {
  const cacheKey = "products:all";

  const start = performance.now();

  // 1. Check Redis
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    const duration = performance.now() - start;

    return res.json({
      source: "redis",
      cache: "HIT",
      duration: Number(duration.toFixed(3)),
      data: JSON.parse(cachedData)
    });
  }

  // 2. Cache miss: query SQLite
  const products = db.prepare(
    "SELECT * FROM products LIMIT 100"
  ).all();

  // 3. Save result in Redis for 60 seconds
  await redis.set(
    cacheKey,
    JSON.stringify(products),
    { EX: 60 }
  );

  const duration = performance.now() - start;

  return res.json({
    source: "sqlite",
    cache: "MISS",
    duration: Number(duration.toFixed(3)),
    data: products
  });
});

export default router;
