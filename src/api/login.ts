import type { Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";
import { UnauthorizedError } from "../errors/errors.js";
import { checkPasswordHash } from "../auth/passwords.js";

export async function handlerLogin(req: Request, res: Response) {
  type Parameters = {
    email: string;
    password: string;
  };

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

  const { hashedPassword, ...safeUser } = user;

  res.status(200).json(safeUser);
}
