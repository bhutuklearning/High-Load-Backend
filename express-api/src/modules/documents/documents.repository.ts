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

    async getAllDocuments(
        page: number,
        limit: number
    ) {

        const skip =
            (page - 1) * limit;

        const [documents, total] =
            await Promise.all([

                prisma.document.findMany({
                    skip,
                    take: limit,

                    orderBy: {
                        created_at: "desc",
                    },
                }),

                prisma.document.count(),
            ]);

        return {
            documents,
            total,
        };
    }

    async getDocumentById(id: string) {

        return prisma.document.findUnique({
            where: {
                id,
            },
        });
    }

    async updateDocumentStatus(
        id: string,
        status: string
    ) {

        return prisma.document.update({
            where: {
                id,
            },

            data: {
                status,
            },
        });
    }

    async deleteDocument(id: string) {

        return prisma.document.delete({
            where: {
                id,
            },
        });
    }

    async updateDocumentAIFields(
        id: string,
        data: {
            summary: string;
            keywords: string[];
            sentiment: string;
            status: string;
        }
    ) {
        return prisma.document.update({
            where: {
                id,
            },
            data: {
                summary: data.summary,
                keywords: data.keywords,
                sentiment: data.sentiment,
                status: data.status,
            },
        });
    }

    async searchDocuments(
        query: string,
        page: number,
        limit: number
    ) {

        const skip =
            (page - 1) * limit;

        const [documents, total] =
            await Promise.all([

                prisma.document.findMany({
                    where: {
                        OR: [
                            {
                                title: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },

                            {
                                content: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },

                            {
                                summary: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },

                    skip,
                    take: limit,

                    orderBy: {
                        created_at: "desc",
                    },
                }),

                prisma.document.count({
                    where: {
                        OR: [
                            {
                                title: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },

                            {
                                content: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },

                            {
                                summary: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                }),
            ]);

        return {
            documents,
            total,
        };
    }
}

export const documentsRepository = new DocumentsRepository();