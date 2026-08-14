import type { Request, Response } from "express";
import { config } from "../config.js";


export function handlerMetrics(req: Request, res: Response) {
  res.set("Content-Type", "text/plain");
  res.send(`Hits: ${config.fileserverHits}`);
}
