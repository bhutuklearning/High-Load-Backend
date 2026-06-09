import rateLimit from "express-rate-limit";

const maxLimit = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 100;
const windowMs = process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : 15 * 60 * 1000;

export const apiRateLimiter = rateLimit({
    windowMs,
    max: maxLimit,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.DISABLE_RATE_LIMITER === "true",
    message: {
        message: "Too many requests. Please try again later.",
    },
});

