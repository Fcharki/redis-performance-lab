import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectRedis } from "./config/redis";
import productRoutes from "./routes/products";
import { rateLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(cors());
app.use(express.json());

// Normal API routes
app.use("/api/products", productRoutes);

// Rate limiting experiment
app.get("/api/limited", rateLimiter, (req, res) => {
  res.json({
    message: "Request successful!"
  });
});

const PORT = 3000;

async function startServer() {
  try {
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
