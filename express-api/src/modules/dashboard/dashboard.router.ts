import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.get("/stats", asyncHandler(
    dashboardController
        .getStats
        .bind(dashboardController)
)
);

export default router;