import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import healthRouter from "./modules/health/health.router.js";
import usersRouter from "./modules/users/users.router.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { metricsMiddleware } from "./middleware/metricsMiddleware.js";
import metricsRouter from "./modules/metrics/metrics.router.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(metricsMiddleware);
  app.use(apiRateLimiter);

  app.use("/api/health", healthRouter);
  app.use("/api/users", usersRouter);
  app.use("/metrics", metricsRouter);

  app.use(errorHandler);
  return app;
}

