// import { prisma } from "../../config/prisma.js";

// export class DocumentsRepository {

//     async createDocument(data: {
//         title: string;
//         content: string;
//         reading_time: number;
//     }) {
//         return prisma.document.create({
//             data,
//         });
//     }

//     async getAllDocuments() {
//         return prisma.document.findMany({
//             orderBy: {
//                 created_at: "desc",
//             },
//         });
//     }

//     async getDocumentById(id: string) {

//         return prisma.document.findUnique({
//             where: {
//                 id,
//             },
//         });
//     }

//     async updateDocumentStatus(
//         id: string,
//         status: string
//     ) {

//         return prisma.document.update({
//             where: {
//                 id,
//             },

//             data: {
//                 status,
//             },
//         });
//     }

//     async deleteDocument(id: string) {
//         return prisma.document.delete({
//             where: {
//                 id,
//             },
//         });
//     }
// }

// export const documentsRepository =  new DocumentsRepository();


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
}

export const documentsRepository = new DocumentsRepository();