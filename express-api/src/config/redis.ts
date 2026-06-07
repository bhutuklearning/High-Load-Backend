import {Redis} from "ioredis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),

  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  logger.info("Connected to Redis");
});

redis.on("error", (err: Error) => {
  logger.error(err, "Redis connection error");
});

