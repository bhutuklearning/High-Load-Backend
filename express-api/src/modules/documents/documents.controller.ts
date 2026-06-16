import { Request, Response, NextFunction, } from "express";
import { createDocumentSchema, getDocumentSchema, paginationSchema, searchDocumentsSchema } from "./documents.schema.js";

import { documentsService } from "./documents.service.js";

export class DocumentsController {

    async createDocument(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {
            const validated = createDocumentSchema.parse(req.body);
            const document = await documentsService.createDocument(
                validated.title,
                validated.content
            );

            res.status(201).json(document);

        } catch (err) {
            next(err);
        }
    }

    async getAllDocuments(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {
            const validated = paginationSchema.parse(req.query);
            const documents = await documentsService.getAllDocuments(
                validated.page,
                validated.limit
            );
            res.status(200).json(documents);
        } catch (err) {
            next(err);
        }
    }

    async getDocumentById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const validated =
                getDocumentSchema.parse({
                    id: req.params.id,
                });

            const document =
                await documentsService
                    .getDocumentById(
                        validated.id
                    );

            if (!document) {

                res.status(404).json({
                    message:
                        "Document not found",
                });

                return;
            }

            res.status(200).json(document);

        } catch (err) {
            next(err);
        }
    }

    async deleteDocument(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const validated =
                getDocumentSchema.parse({
                    id: req.params.id,
                });

            const result =
                await documentsService
                    .deleteDocument(
                        validated.id
                    );

            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    }

    async searchDocuments(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const validated =
                searchDocumentsSchema.parse(
                    req.query
                );

            const result =
                await documentsService
                    .searchDocuments(
                        validated.q,
                        validated.page,
                        validated.limit
                    );

            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    }
}

export const documentsController = new DocumentsController();