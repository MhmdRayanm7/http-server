import type { Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "../errors/errors.js";
import { deleteAllUsers } from "../db/queries/users.js";

export async function handlerReset(req: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError(
      "Reset is only allowed in the development environment",
    );
  }

  await deleteAllUsers();

  config.api.fileserverHits = 0;
  res.send(`Hits reset to: ${config.api.fileserverHits}`);
}
