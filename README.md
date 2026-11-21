# Redis Performance Lab

A full-stack demo for measuring how much Redis caching improves API latency compared with querying SQLite directly. It ships with an interactive dashboard, a request benchmark, and a Redis-backed rate limiter.

## Use case

Use this app to explore and demonstrate:

- The latency difference between a direct database query and a cached response.
- How a cache-aside pattern behaves on `HIT` and `MISS`.
- Cache hit ratio and the average speed improvement.
- How a fixed-window rate limiter works with Redis.

## How it works

```
Browser (React dashboard)
        |
        |  /api/*  (Vite dev proxy)
        v
Express API (port 3000)
        |
        +--> Redis (cache + rate limit counters)
        |
        +--> SQLite (database.sqlite)
```

### Request flows

1. `GET /api/products` measures a direct SQLite query and returns the rows plus the server-side duration.
2. `GET /api/products/cached` uses the cache-aside pattern:
   - Reads the `products:all` key from Redis.
   - On a **HIT**, returns the cached JSON immediately.
   - On a **MISS**, queries SQLite, stores the JSON in Redis for 60 seconds, then responds.
3. `GET /api/limited` is protected by a Redis fixed-window rate limiter:
   - Each request runs `INCR rate-limit:<ip>`.
   - The first request in a window sets a 60-second expiry.
   - Requests above 10 per window receive `429 Too Many Requests`.

### Frontend

- `useBenchmark` owns the dashboard state: products, timings, hit/miss counters, metrics, and the 20-request benchmark.
- `useRateLimit` sends 11 requests and records which one is rejected.
- The dashboard is composed from `DashboardHeader`, `MetricCard`, `PerformanceChart`, `BenchmarkPanel`, `ProductsPreview`, and `RequestPanel`.

The backend seeds 5,000 products on first start and every API response returns at most 100 rows.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Axios, Lucide |
| Backend | Node.js, Express 5, TypeScript, tsx |
| Database | SQLite via better-sqlite3 |
| Cache / rate limiting | Redis (node-redis client) |
| Testing | Vitest, Testing Library, Supertest |

## Project structure

```
.
├── backend/
│   └── src/
│       ├── app.ts              # Express app and routes
│       ├── server.ts           # Redis connection + HTTP listener
│       ├── config/             # SQLite and Redis clients
│       ├── middleware/         # Rate limiter
│       └── routes/             # Product endpoints
└── frontend/
    └── src/
        ├── App.tsx             # Dashboard composition
        ├── components/         # Dashboard UI components
        ├── hooks/              # useBenchmark, useRateLimit
        ├── services/           # Axios API client
        └── types/              # Shared TypeScript types
```

## Prerequisites

- Node.js 20 or newer
- npm
- A running Redis instance

Start Redis with Docker if you do not have it installed locally:

```bash
docker run --name redis-lab -p 6379:6379 -d redis:7-alpine
```

## Running the app

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:3000`.

Redis defaults to `redis://localhost:6379`. To override it, create `backend/.env`:

```env
REDIS_URL=redis://localhost:6379
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend on port 3000.

## Commands

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm test` | Run the backend test suite |
| `npm run test:watch` | Run tests in watch mode |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the frontend test suite |
| `npm run test:watch` | Run tests in watch mode |

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/products` | Products from SQLite with query duration |
| `GET` | `/api/products/cached` | Cache-aside response with `HIT`/`MISS` status |
| `GET` | `/api/limited` | Rate-limited endpoint (10 requests per 60 seconds) |

Example cached response:

```json
{
  "source": "redis",
  "cache": "HIT",
  "duration": 0.42,
  "data": [{ "id": 1, "name": "Product 1", "price": 9.99, "category": "Books" }]
}
```

## Tests

The backend suite covers the SQLite route, cache `HIT`/`MISS` behavior, and the rate limiter (including Redis failure handling). The frontend suite covers both hooks, key components, and an App smoke test.

```bash
cd backend && npm test
cd frontend && npm test
```
