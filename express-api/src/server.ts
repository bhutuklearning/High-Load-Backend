import { createServer } from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

import "./config/database.js";
import "./config/redis.js";

const app = createApp();
const server = createServer(app);

server.listen(Number(env.PORT), "0.0.0.0", () => {
  logger.info(`Server running on port ${env.PORT}`);
});

function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
