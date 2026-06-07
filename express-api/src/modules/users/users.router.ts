import { Router } from "express";
import { usersService } from "./users.service.js";
import { z } from "zod";

const router = Router();

const createUserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(255),
});

const getUserSchema = z.object({
    id: z.string().uuid(),
});

// POST /api/users
router.post("/", async (req, res, next) => {
    try {
        const validated = createUserSchema.parse(req.body);
        const user = await usersService.createUser(validated.name, validated.email);
        res.status(201).json(user);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({
                message: "Validation Error",
                errors: err.issues,
            });
        } else {
            next(err);
        }
    }
});

// GET /api/users/:id
router.get("/:id", async (req, res, next) => {
    try {
        const validated = getUserSchema.parse({ id: req.params.id });
        const user = await usersService.getUserById(validated.id);

        if (!user) {
             res.status(404).json({
                message: "User not found",
            });
             return;
        }

        res.status(200).json(user);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({
                message: "Validation Error",
                errors: err.issues,
            });
        } else {
            next(err);
        }
    }
});

export default router;
