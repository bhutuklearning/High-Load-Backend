import { Router } from "express";
import { documentsRepository } from "../documents/documents.repository.js";
import { setCache } from "../../config/cache.js";

const router = Router();

router.post( "/documents/:id/complete", async (req, res) => {

        const { id } = req.params;
        const aiResponse = req.body.raw_response;

        const summaryMatch =
            aiResponse.match(
                /Summary:\s*(.*)/i
            );

        const keywordsMatch =
            aiResponse.match(
                /Keywords:\s*(.*)/i
            );

        const sentimentMatch =
            aiResponse.match(
                /Sentiment:\s*(.*)/i
            );

        const updated =
            await documentsRepository
                .updateDocumentAIFields(
                    id,
                    {
                        summary:
                            summaryMatch?.[1] || "",

                        keywords:
                            keywordsMatch?.[1]
                                ?.split(",")
                                .map(
                                    (k: string) =>
                                        k.trim()
                                ) || [],

                        sentiment:
                            sentimentMatch?.[1] ||
                            "neutral",

                        status:
                            "processed",
                    }
                );

        await setCache(
            `document:${id}`,
            updated
        );

        res.json({
            success: true,
        });
    }
);

router.post( "/documents/:id/failed", async (req, res) => {
        const updated =
            await documentsRepository
                .updateDocumentStatus(
                    req.params.id,
                    "failed"
                );

        await setCache(
            `document:${req.params.id}`,
            updated
        );

        res.json({
            success: true,
        });
    }
);

export default router;