import { prisma } from "../../config/prisma.js";

export class DashboardService {

    async getStats() {

        const [
            totalUsers,
            totalDocuments,
            processedDocuments,
            pendingDocuments,
            failedDocuments,
        ] = await Promise.all([

            prisma.user.count(),
            prisma.document.count(),
            prisma.document.count({
                where: {
                    status: "processed",
                },
            }),

            prisma.document.count({
                where: {
                    status: "pending",
                },
            }),

            prisma.document.count({
                where: {
                    status: "failed",
                },
            }),
        ]);

        return {
            users: totalUsers,
            documents: totalDocuments,
            processed: processedDocuments,
            pending: pendingDocuments,
            failed: failedDocuments,
        };
    }
}

export const dashboardService = new DashboardService();