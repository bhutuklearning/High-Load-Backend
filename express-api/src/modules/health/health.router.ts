
import { Router } from "express";
import { db } from "../../config/database.js";
import { redis } from "../../config/redis.js";

const router = Router();

router.get("/", async (_req, res) => {
    let dbStatus = "failed";
    let redisStatus = "failed";
    let hasError = false;

    try {
        const dbCheck = await db.query("SELECT 1");
        if (dbCheck.rowCount === 1) {
            dbStatus = "connected";
        } else {
            hasError = true;
        }
    } catch (err) {
        dbStatus = `failed: ${(err as Error).message}`;
        hasError = true;
    }

    try {
        const redisCheck = await redis.ping();
        if (redisCheck === "PONG") {
            redisStatus = "connected";
        } else {
            hasError = true;
        }
    } catch (err) {
        redisStatus = `failed: ${(err as Error).message}`;
        hasError = true;
    }

    res.status(hasError ? 503 : 200).json({
        status: hasError ? "error" : "ok",
        postgres: dbStatus,
        redis: redisStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

router.get("/live", (_req, res) => {
    res.status(200).json({
        status: "alive",
    });
});

router.get("/ready", async (_req, res) => {
    try {
        await db.query("SELECT 1");
        await redis.ping();

        res.status(200).json({
            status: "ready",
        });
    } catch {
        res.status(503).json({
            status: "not ready",
        });
    }
});

export default router;

