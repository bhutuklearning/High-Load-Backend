import { redis } from "./redis.js";

export async function getCache<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    if (!cached) {
        return null;
    }
    return JSON.parse(cached) as T;
}

export async function setCache(
    key: string,
    value: unknown,
    ttlSeconds = 3600
) {
    await redis.set(
        key,
        JSON.stringify(value),
        "EX",
        ttlSeconds
    );
}

export async function deleteCache(key: string) {
    await redis.del(key);
}

export async function invalidatePattern(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
}
