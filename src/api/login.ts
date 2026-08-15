import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { UnauthorizedError } from "../errors/errors.js";
import { checkPasswordHash } from "../auth/passwords.js";
import { makeJWT } from "../auth/tokens.js";
import { config } from "../config.js";

export async function handlerLogin(req: Request, res: Response) {
  type Parameters = {
    email: string;
    password: string;
    expiresInSeconds?: number;
  };

  const DEFAULT_EXPIRATION = 3600;

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

  const requestedExpiration = params.expiresInSeconds ?? DEFAULT_EXPIRATION;

  const expiration = Math.min(requestedExpiration, DEFAULT_EXPIRATION);

  const token = makeJWT(user.id, expiration, config.api.jwtSecret);

  const { hashedPassword, ...safeUser } = user;

  const response = { ...safeUser, token };

  res.status(200).json(response);
}
