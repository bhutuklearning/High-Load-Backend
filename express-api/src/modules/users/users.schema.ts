import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().min(1).max(100),

    email: z
        .string()
        .email()
        .max(255),
});

export const getUserSchema = z.object({
    id: z.string().uuid(),
});

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),

    limit: z.coerce.number().min(1).max(100).default(10),
});

export type CreateUserInput =
    z.infer<typeof createUserSchema>;

export type GetUserInput =
    z.infer<typeof getUserSchema>;

export type PaginationInput =
    z.infer<typeof paginationSchema>;
