import { Pool } from "pg";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const db = new Pool({
  host: env.POSTGRES_HOST,
  port: Number(env.POSTGRES_PORT),
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on("connect", () => {
  logger.info("Connected to PostgreSQL");
});

db.on("error", (err) => {
  logger.error(err, "PostgreSQL connection error");
});

