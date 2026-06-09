// import {
//   Request,
//   Response,
//   NextFunction,
// } from "express";

// import { v4 as uuidv4 } from "uuid";
// import { logger } from "../utils/logger.js";

// declare module "express-serve-static-core" {
//   interface Request {
//     requestId: string;
//     log: any;
//   }
// }

// export function requestContext(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   const requestId = req.headers["x-request-id"] as string || uuidv4();
//   req.requestId = requestId;
//   req.log = logger.child({
//     requestId,
//     method: req.method,
//     path: req.path,
//   });

//   res.setHeader(
//     "X-Request-ID",
//     requestId
//   );

//   next();
// }








import { Request, Response, NextFunction, } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger.js";


declare module "express-serve-static-core" {
  interface Request {
    requestId: string;
    log: typeof logger;
  }
}

export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.headers["x-request-id"] as string || uuidv4();
  req.requestId = requestId;
  req.log = logger.child({
    requestId,
    method: req.method,
    path: req.path,
  });

  res.setHeader(
    "X-Request-ID",
    requestId
  );

  next();
}