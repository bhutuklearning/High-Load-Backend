import { z } from "zod";

export const createDocumentSchema = z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
});

export const getDocumentSchema = z.object({
    id: z.string().uuid(),
});

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),

    limit: z.coerce.number()
        .min(1)
        .max(100)
        .default(10),
});