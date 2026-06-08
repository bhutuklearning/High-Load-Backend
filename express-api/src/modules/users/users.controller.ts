import {
    Request,
    Response,
    NextFunction,
} from "express";

import { usersService }
    from "./users.service.js";

import {
    createUserSchema,
    getUserSchema,
    paginationSchema,
} from "./users.schema.js";

export class UsersController {

    async createUser(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const validated =
                createUserSchema.parse(req.body);

            const user =
                await usersService.createUser(
                    validated.name,
                    validated.email
                );

            res.status(201).json(user);

        } catch (err) {
            next(err);
        }
    }

    async getUserById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const validated =
                getUserSchema.parse({
                    id: req.params.id,
                });

            const user =
                await usersService.getUserById(
                    validated.id
                );

            if (!user) {
                res.status(404).json({
                    message: "User not found",
                });
                return;
            }

            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }

    async getAllUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ) {

        try {

            const validated =
                paginationSchema.parse(req.query);

            const users =
                await usersService.getAllUsers(
                    validated.page,
                    validated.limit
                );

            res.status(200).json(users);

        } catch (err) {
            next(err);
        }
    }
}

export const usersController =
    new UsersController();

