import pino from "pino";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      log: pino.Logger;
    }
  }
}

export {};