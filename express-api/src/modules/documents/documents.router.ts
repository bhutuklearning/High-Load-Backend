import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { documentsController } from "./documents.controller.js";

const router = Router();

router.post("/", asyncHandler(
        documentsController.createDocument.bind(documentsController)
    )
);

router.get("/", asyncHandler(
        documentsController.getAllDocuments.bind(documentsController)
    )
);

router.get("/:id", asyncHandler(
        documentsController.getDocumentById.bind(documentsController)
    )
);

router.delete("/:id", asyncHandler(
        documentsController.deleteDocument.bind(documentsController)
    )
);

export default router;