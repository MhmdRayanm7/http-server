import type { Request, Response } from "express";
import { config } from "../config.js";


export function handlerMetrics(req: Request, res: Response) {
  res.set("Content-Type", "text/plain"); // (not necessary)  automatically detects the type of data passed into it and sets an appropriate
  res.send(`Hits: ${config.fileserverHits}`);
}
