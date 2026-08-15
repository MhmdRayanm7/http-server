import type { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerReset(req: Request, res: Response) {
  config.api.fileserverHits = 0;
  res.send(`Hits reset to: ${config.api.fileserverHits }`);
  res.end();
}
