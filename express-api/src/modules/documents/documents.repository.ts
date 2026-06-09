import { prisma } from "../../config/prisma.js";

export class DocumentsRepository {

    async createDocument(data: {
        title: string;
        content: string;
        reading_time: number;
    }) {
        return prisma.document.create({
            data,
        });
    }

    async getAllDocuments() {
        return prisma.document.findMany({
            orderBy: {
                created_at: "desc",
            },
        });
    }

    async getDocumentById(id: string) {
        return prisma.document.findUnique({
            where: { id },
        });
    }

    async deleteDocument(id: string) {
        return prisma.document.delete({
            where: { id },
        });
    }
}

export const documentsRepository = new DocumentsRepository();