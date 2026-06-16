import { Request, Response, NextFunction, } from "express";
import { dashboardService } from "./dashboard.service.js";

export class DashboardController {
    async getStats(
        _req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const stats =
                await dashboardService
                    .getStats();

            res.status(200).json(stats);

        } catch (err) {
            next(err);
        }
    }
}

export const dashboardController = new DashboardController();