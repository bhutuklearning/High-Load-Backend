import { z } from "zod";

export const createDocumentSchema = z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
});

export const getDocumentSchema = z.object({
    id: z.string().uuid(),
});