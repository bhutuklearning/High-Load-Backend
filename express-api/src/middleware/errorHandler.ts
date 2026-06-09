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




// import {
//     NextFunction,
//     Request,
//     Response,
// } from "express";

// import { ZodError } from "zod";
// import { logger } from "../utils/logger.js";
// import { AppError } from "../errors/AppError.js";

// export function errorHandler(
//     err: Error,
//     _req: Request,
//     res: Response,
//     _next: NextFunction
// ) {

//     logger.error(err);

//     // Zod validation errors
//     if (err instanceof ZodError) {

//         return res.status(400).json({
//             message: "Validation Error",

//             errors: err.issues,
//         });
//     }

//     // Custom App Errors
//     if (err instanceof AppError) {

//         return res.status(
//             err.statusCode
//         ).json({

//             message: err.message,
//         });
//     }

//     // Unknown errors
//     return res.status(500).json({
//         message: "Internal Server Error",
//     });
// }










// import { NextFunction, Request, Response, } from "express";
// import { ZodError } from "zod";

// import { AppError } from "../errors/AppError.js";

// export function errorHandler(
//     err: Error,
//     req: Request,
//     res: Response,
//     _next: NextFunction
// ) {
//     req.log.error(
//         {
//             err,
//             requestId: req.requestId,
//         },
//         "Request failed"
//     );

//     // Zod Validation Errors
//     if (err instanceof ZodError) {
//         return res.status(400).json({
//             success: false,
//             type: "VALIDATION_ERROR",
//             message: "Validation Error",
//             errors: err.issues,
//             requestId: req.requestId,
//         });
//     }

//     // Custom App Errors
//     if (err instanceof AppError) {

//         return res.status(
//             err.statusCode
//         ).json({
//             success: false,
//             type: err.name,
//             message: err.message,
//             requestId: req.requestId,
//         });
//     }

//     // Unknown Errors
//     return res.status(500).json({
//         success: false,
//         type: "INTERNAL_SERVER_ERROR",
//         message: "Internal Server Error",
//         requestId: req.requestId,
//     });
// }









import { NextFunction, Request, Response, } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) {

    req.log.error(
        {
            err,
            requestId: req.requestId,
        },
        "Request failed"
    );

    // Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            type: "VALIDATION_ERROR",
            message: "Validation Error",
            errors: err.issues,
            requestId: req.requestId,
        });
    }

    // App Errors
    if (err instanceof AppError) {
        return res.status(
            err.statusCode
        ).json({
            success: false,
            type: err.name,
            message: err.message,
            requestId: req.requestId,
        });
    }

    // Unknown Errors
    return res.status(500).json({
        success: false,
        type: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
        requestId: req.requestId,
    });
}

