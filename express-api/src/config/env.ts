import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.string(),

    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),

    REDIS_HOST: z.string(),
    REDIS_PORT: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment variables");
    console.error(parsedEnv.error.flatten().fieldErrors);

    process.exit(1);
}

export const env = parsedEnv.data;

