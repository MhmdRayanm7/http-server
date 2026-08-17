import type { Request, Response } from "express";

import { upgradeUserToChirpyRed } from "../db/queries/users.js";
import { NotFoundError, UnauthorizedError } from "../errors/errors.js";
import { getAPIKey } from "../auth/tokens.js";
import { config } from "../config.js";

export async function handlerPolkaWebhook(req: Request, res: Response) {
  type Parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const apiKey = getAPIKey(req);

  if (apiKey !== config.api.polkaKey) {
    throw new UnauthorizedError("Invalid API key");
  }

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
