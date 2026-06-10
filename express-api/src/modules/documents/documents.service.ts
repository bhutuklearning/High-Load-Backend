// import { getCache, setCache, deleteCache, } from "../../config/cache.js";

// import { documentsRepository } from "./documents.repository.js";

// export class DocumentsService {

//     async createDocument(
//         title: string,
//         content: string
//     ) {

//         const words = content.split(/\s+/).length;

//         const reading_time = Math.ceil(words / 200);

//         const document =
//             await documentsRepository.createDocument({
//                 title,
//                 content,
//                 reading_time,
//             });

//         await setCache(
//             `document:${document.id}`,
//             document
//         );

//         return document;
//     }

//     async getAllDocuments() {
//         return documentsRepository.getAllDocuments();
//     }

//     async getDocumentById(id: string) {
//         const cached =
//             await getCache(
//                 `document:${id}`
//             );

//         if (cached) {
//             console.log("DOCUMENT CACHE HIT");
//             return cached;
//         }

//         console.log("DOCUMENT DATABASE HIT");

//         const document = await documentsRepository.getDocumentById(id);

//         if (!document) {
//             return null;
//         }

//         await setCache(
//             `document:${id}`,
//             document
//         );

//         return document;
//     }

//     async deleteDocument(id: string) {

//         await documentsRepository.deleteDocument(id);
//         await deleteCache(
//             `document:${id}`
//         );

//         return {
//             message:
//                 "Document deleted successfully",
//         };
//     }
// }

// export const documentsService = new DocumentsService();








// import {
//     getCache,
//     setCache,
//     deleteCache,
// } from "../../config/cache.js";

// import { documentsRepository } from "./documents.repository.js";

// import {
//     documentsCreatedTotal,
//     documentsDeletedTotal,
//     cacheHitsTotal,
//     cacheMissesTotal,
//     documentProcessingDuration,
// } from "../../utils/metrics.js";

// export class DocumentsService {

//     async createDocument(
//         title: string,
//         content: string
//     ) {

//         // Start metrics timer
//         const endTimer =
//             documentProcessingDuration.startTimer();

//         // Calculate reading time
//         const words =
//             content.split(/\s+/).length;

//         const reading_time =
//             Math.ceil(words / 200);

//         // Create document
//         const document =
//             await documentsRepository.createDocument({
//                 title,
//                 content,
//                 reading_time,
//             });

//         // Increment metric
//         documentsCreatedTotal.inc();

//         // Store in Redis cache
//         await setCache(
//             `document:${document.id}`,
//             document
//         );

//         // Stop timer
//         endTimer();

//         // Simulate async AI/background processing
//         setTimeout(async () => {

//             console.log(
//                 `Processing document ${document.id}`
//             );

//             await documentsRepository
//                 .updateDocumentStatus(
//                     document.id,
//                     "processed"
//                 );

//             console.log(
//                 `Processed document ${document.id}`
//             );

//         }, 5000);

//         return document;
//     }

//     async getAllDocuments() {

//         return documentsRepository
//             .getAllDocuments();
//     }

//     async getDocumentById(id: string) {

//         // Check cache first
//         const cached =
//             await getCache(
//                 `document:${id}`
//             );

//         // Cache hit
//         if (cached) {

//             cacheHitsTotal.inc();

//             console.log(
//                 "DOCUMENT CACHE HIT"
//             );

//             return cached;
//         }

//         // Cache miss
//         cacheMissesTotal.inc();

//         console.log(
//             "DOCUMENT DATABASE HIT"
//         );

//         // Fetch from DB
//         const document =
//             await documentsRepository
//                 .getDocumentById(id);

//         if (!document) {
//             return null;
//         }

//         // Store back into cache
//         await setCache(
//             `document:${id}`,
//             document
//         );

//         return document;
//     }

//     async deleteDocument(id: string) {

//         await documentsRepository
//             .deleteDocument(id);

//         // Increment metric
//         documentsDeletedTotal.inc();

//         // Delete from cache
//         await deleteCache(
//             `document:${id}`
//         );

//         return {
//             message:
//                 "Document deleted successfully",
//         };
//     }
// }

// export const documentsService = new DocumentsService();







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

export class DocumentsService {

    async createDocument(
        title: string,
        content: string
    ) {

        // Start metrics timer
        const endTimer =
            documentProcessingDuration.startTimer();

        // Calculate reading time
        const words =
            content.split(/\s+/).length;

        const reading_time =
            Math.ceil(words / 200);

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
        setTimeout(async () => {

            try {

                console.log(
                    `Processing document ${document.id}`
                );

                // Update DB
                const updatedDocument =
                    await documentsRepository
                        .updateDocumentStatus(
                            document.id,
                            "processed"
                        );

                // IMPORTANT:
                // Update cache also
                await setCache(
                    `document:${document.id}`,
                    updatedDocument
                );

                console.log(
                    `Processed document ${document.id}`
                );

            } catch (error) {

                console.error(
                    "Background processing failed:",
                    error
                );
            }

        }, 5000);

        return document;
    }

    async getAllDocuments() {

        return documentsRepository
            .getAllDocuments();
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