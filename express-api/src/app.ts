import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import healthRouter from "./modules/health/health.router.js";
import usersRouter from "./modules/users/users.router.js";

import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/users", usersRouter);

  app.use(errorHandler);
  return app;
}

