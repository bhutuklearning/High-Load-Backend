import { getCache, setCache, deleteCache, } from "../../config/cache.js";

import { documentsRepository } from "./documents.repository.js";

export class DocumentsService {

    async createDocument(
        title: string,
        content: string
    ) {

        const words = content.split(/\s+/).length;

        const reading_time = Math.ceil(words / 200);

        const document =
            await documentsRepository.createDocument({
                title,
                content,
                reading_time,
            });

        await setCache(
            `document:${document.id}`,
            document
        );

        return document;
    }

    async getAllDocuments() {
        return documentsRepository.getAllDocuments();
    }

    async getDocumentById(id: string) {
        const cached =
            await getCache(
                `document:${id}`
            );

        if (cached) {
            console.log("DOCUMENT CACHE HIT");
            return cached;
        }

        console.log("DOCUMENT DATABASE HIT");

        const document = await documentsRepository.getDocumentById(id);

        if (!document) {
            return null;
        }

        await setCache(
            `document:${id}`,
            document
        );

        return document;
    }

    async deleteDocument(id: string) {

        await documentsRepository.deleteDocument(id);
        await deleteCache(
            `document:${id}`
        );

        return {
            message:
                "Document deleted successfully",
        };
    }
}

export const documentsService =
    new DocumentsService();