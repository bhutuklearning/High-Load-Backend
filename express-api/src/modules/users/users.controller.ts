import { Request, Response, NextFunction, } from "express";
import { usersService } from "./users.service.js";
import { createUserSchema, getUserSchema, paginationSchema, } from "./users.schema.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

export class UsersController {
    async createUser(
        req: Request,
        res: Response,
        _next: NextFunction
    ) {

        const validated = createUserSchema.parse(req.body);
        const user = await usersService.createUser(
            validated.name,
            validated.email
        );
        res.status(201).json(user);
    }

    async getUserById(
        req: Request,
        res: Response,
        _next: NextFunction
    ) {

        const validated = getUserSchema.parse({
            id: req.params.id,
        });

        const user = await usersService.getUserById(
            validated.id
        );

        if (!user) {
            throw new NotFoundError(
                "User not found"
            );
        }
        res.status(200).json(user);
    }

    async getAllUsers(
        req: Request,
        res: Response,
        _next: NextFunction
    ) {

        const validated = paginationSchema.parse(req.query);

        const users = await usersService.getAllUsers(
            validated.page,
            validated.limit
        );

        res.status(200).json(users);
    }
}

export const usersController =
    new UsersController();

