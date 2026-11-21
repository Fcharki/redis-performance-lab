import { Request, Response, NextFunction } from "express";
import redis from "../config/redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 10;

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ip = req.ip || "unknown";
    const key = `rate-limit:${ip}`;

    const count = await redis.incr(key);

    // Set expiration on the first request
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, MAX_REQUESTS - count)
    );

    if (count > MAX_REQUESTS) {
      return res.status(429).json({
        message: "Too many requests. Try again later."
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    return res.status(500).json({
      message: "Rate limiter unavailable"
    });
  }
}
