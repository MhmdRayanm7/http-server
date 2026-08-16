import type { Request, Response } from "express";

import { getUserByEmail } from "../db/queries/users.js";
import { createRefreshToken } from "../db/queries/refreshTokens.js";
import { UnauthorizedError } from "../errors/errors.js";
import { checkPasswordHash } from "../auth/passwords.js";
import { makeJWT, makeRefreshToken } from "../auth/tokens.js";
import { config } from "../config.js";

export async function handlerLogin(req: Request, res: Response) {
  type Parameters = {
    email: string;
    password: string;
  };

  const ACCESS_TOKEN_EXPIRATION = 60 * 60;
  const REFRESH_TOKEN_EXPIRATION = 60 * 24 * 60 * 60 * 1000;

  const params: Parameters = req.body;

  const user = await getUserByEmail(params.email);

  if (!user) {
    throw new UnauthorizedError("incorrect email or password");
  }

  const passwordMatches = await checkPasswordHash(
    params.password,
    user.hashedPassword,
  );

  if (!passwordMatches) {
    throw new UnauthorizedError("incorrect email or password");
  }

  const token = makeJWT(user.id, ACCESS_TOKEN_EXPIRATION, config.api.jwtSecret);

  const refreshToken = makeRefreshToken();

  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION);

  await createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: refreshTokenExpiresAt,
    revokedAt: null,
  });

  const { hashedPassword, ...safeUser } = user;

  const response = {
    ...safeUser,
    token,
    refreshToken,
  };

  res.status(200).json(response);
}
