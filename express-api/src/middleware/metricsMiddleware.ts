// import { Request, Response, NextFunction } from "express";

// import {
//     httpRequestsTotal,
//     httpRequestDuration,
// } from "../utils/metrics.js";

// export function metricsMiddleware(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {

//     const start = Date.now();
//     res.on("finish", () => {
//         const duration = (Date.now() - start) / 1000;
//         httpRequestsTotal.inc({
//             method: req.method,
//             route: req.path,
//             status: res.statusCode,
//         });

//         httpRequestDuration.observe(
//             {
//                 method: req.method,
//                 route: req.path,
//                 status: res.statusCode,
//             },
//             duration
//         );
//     });
//     next();
// }






import { Request, Response, NextFunction, } from "express";
import { httpRequestsTotal, httpRequestDuration, } from "../utils/metrics.js";

export function metricsMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {

    const start = Date.now();
    req.log.info("Request started");
    res.on("finish", () => {
        const duration =
            (Date.now() - start) / 1000;
        httpRequestsTotal.inc({
            method: req.method,
            route: req.path,
            status: res.statusCode,
        });

        httpRequestDuration.observe({
            method: req.method,
            route: req.path,
            status: res.statusCode,
        },
            duration
        );

        req.log.info({
            statusCode: res.statusCode,
            duration,
        }, "Request completed");
    });

    next();
}

