import express from "express";
import cors from "cors";

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

export default app;
