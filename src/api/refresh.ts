import type { Request, Response } from "express";
import { getBearerToken, makeJWT } from "../auth/tokens.js";
import { getUserFromRefreshToken } from "../db/queries/refreshTokens.js";
import { UnauthorizedError } from "../errors/errors.js";
import { config } from "../config.js";

export async function handlerRefresh(req: Request, res: Response) {
  const ACCESS_TOKEN_EXPIRATION = 60 * 60;

  const refreshToken = getBearerToken(req);
  const user = await getUserFromRefreshToken(refreshToken);

  if (!user) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const token = makeJWT(
    user.id,
    ACCESS_TOKEN_EXPIRATION,
    config.api.jwtSecret,
  );

  res.status(200).json({ token });
}