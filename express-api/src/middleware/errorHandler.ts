// import { NextFunction, Request, Response } from "express";
// import { logger } from "../utils/logger.js";

// export function errorHandler(
//     err: Error,
//     _req: Request,
//     res: Response,
//     _next: NextFunction
// ) {
//     logger.error(err);

//     res.status(500).json({
//         message: "Internal Server Error",
//     });
// }




import {
    NextFunction,
    Request,
    Response,
} from "express";

import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { AppError } from "../errors/AppError.js";

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {

    logger.error(err);

    // Zod validation errors
    if (err instanceof ZodError) {

        return res.status(400).json({
            message: "Validation Error",

            errors: err.issues,
        });
    }

    // Custom App Errors
    if (err instanceof AppError) {

        return res.status(
            err.statusCode
        ).json({

            message: err.message,
        });
    }

    // Unknown errors
    return res.status(500).json({
        message: "Internal Server Error",
    });
}

