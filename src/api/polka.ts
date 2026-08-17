import type { Request, Response } from "express";

import { upgradeUserToChirpyRed } from "../db/queries/users.js";
import { NotFoundError } from "../errors/errors.js";

export async function handlerPolkaWebhook(req: Request, res: Response) {
  type Parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const params: Parameters = req.body;

  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  const user = await upgradeUserToChirpyRed(params.data.userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(204).send();
}
