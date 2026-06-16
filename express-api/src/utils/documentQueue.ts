import { redis } from "../config/redis.js";

export async function enqueueDocumentJob(
    job: {
        documentId: string;
        title: string;
        content: string;
    }
) {

    await redis.lpush(
        "document-processing-queue",
        JSON.stringify(job)
    );
}