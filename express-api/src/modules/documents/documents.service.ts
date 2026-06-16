import {
    getCache,
    setCache,
    deleteCache,
} from "../../config/cache.js";
import { documentsRepository } from "./documents.repository.js";

import {
    documentsCreatedTotal,
    documentsDeletedTotal,
    cacheHitsTotal,
    cacheMissesTotal,
    documentProcessingDuration,
} from "../../utils/metrics.js";
import axios from "axios";

export class DocumentsService {

    async createDocument(
        title: string,
        content: string
    ) {

        // Start metrics timer
        const endTimer = documentProcessingDuration.startTimer();

        // Calculate reading time
        const words = content.split(/\s+/).length;

        const reading_time = Math.ceil(words / 200);

        // Create document
        const document =
            await documentsRepository.createDocument({
                title,
                content,
                reading_time,
            });

        // Increment metric
        documentsCreatedTotal.inc();

        // Store in Redis cache
        await setCache(
            `document:${document.id}`,
            document
        );

        // Stop metrics timer
        endTimer();

        // Simulate async AI/background processing
        // setTimeout(async () => {
        //     try {

        //         console.log(
        //             `Processing document ${document.id}`
        //         );

        //         // Update DB
        //         const updatedDocument =
        //             await documentsRepository
        //                 .updateDocumentStatus(
        //                     document.id,
        //                     "processed"
        //                 );

        //         // IMPORTANT:
        //         // Update cache also
        //         await setCache(
        //             `document:${document.id}`,
        //             updatedDocument
        //         );

        //         console.log(
        //             `Processed document ${document.id}`
        //         );

        //     } catch (error) {

        //         console.error(
        //             "Background processing failed:",
        //             error
        //         );
        //     }

        // }, 5000);

        setTimeout(async () => {
            try {
                console.log(`Processing document ${document.id} `);
                // Call FastAPI AI worker
                const response =
                    await axios.post(
                        "http://fastapi-service:8000/ai/process",
                        {
                            title: document.title,
                            content: document.content,
                        }
                    );

                const aiResponse = response.data.raw_response;

                console.log(aiResponse);

                // SIMPLE PARSING

                const summaryMatch = aiResponse.match(
                    /Summary:\s*(.*)/i
                );

                const keywordsMatch = aiResponse.match(
                    /Keywords:\s*(.*)/i
                );

                const sentimentMatch = aiResponse.match(
                    /Sentiment:\s*(.*)/i
                );

                const summary = summaryMatch?.[1] || "";

                const keywords = keywordsMatch?.[1]
                    ?.split(",")
                    .map((k: string) => k.trim())
                    || [];

                const sentiment = sentimentMatch?.[1] || "neutral";

                // Update DB with AI fields
                const updatedDocument = await documentsRepository.updateDocumentAIFields(
                    document.id,
                    {
                        summary,
                        keywords,
                        sentiment,
                        status: "processed",
                    }
                );

                // Update Redis cache
                await setCache(
                    `document:${document.id}`,
                    updatedDocument
                );

                console.log(
                    `Processed document ${document.id} `
                );

            } catch (error) {
                console.error("AI processing failed:", error);
                // mark failed
                const failedDocument =await documentsRepository.updateDocumentStatus(
                            document.id,
                            "failed"
                        );

                await setCache(
                    `document:${document.id}`,
                    failedDocument
                );
            }
        }, 3000);
        return document;
    }

    async getAllDocuments(
        page: number,
        limit: number
    ) {
        const {
            documents,
            total,
        } = await documentsRepository.getAllDocuments(
            page,
            limit
        );

        return {
            data: documents,

            pagination: {
                total,
                page,
                limit,

                totalPages:
                    Math.ceil(total / limit),
            },
        };
    }

    async getDocumentById(id: string) {

        // Check cache first
        const cached =
            await getCache(
                `document:${id}`
            );

        // Cache hit
        if (cached) {
            cacheHitsTotal.inc();
            console.log(
                "DOCUMENT CACHE HIT"
            );
            return cached;
        }

        // Cache miss
        cacheMissesTotal.inc();

        console.log(
            "DOCUMENT DATABASE HIT"
        );

        // Fetch from DB
        const document = await documentsRepository.getDocumentById(id);

        if (!document) {
            return null;
        }

        // Store back into cache
        await setCache(
            `document:${id}`,
            document
        );

        return document;
    }

    async deleteDocument(id: string) {
        await documentsRepository.deleteDocument(id);
        // Increment metric
        documentsDeletedTotal.inc();
        // Delete from cache
        await deleteCache(
            `document:${id}`
        );
        return {
            message:
                "Document deleted successfully",
        };
    }
}

export const documentsService = new DocumentsService();