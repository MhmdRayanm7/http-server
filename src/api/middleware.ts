import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export function middlewareErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(err.message);
  res.status(500).json({
    error: "Something went wrong on our end",
  });
  next()
}


export async function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.on("finish", () => {
    const status_code = res.statusCode;
    if (status_code < 200 || status_code >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${status_code}`);
    }
  });
  next();
}

export function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  config.fileserverHits++;
  next();
}
