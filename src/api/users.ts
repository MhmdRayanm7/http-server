import type { Request, Response } from "express";
import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "../errors/errors.js";
import { hashPassword } from "../auth/passwords.js";
import { getBearerToken, validateJWT } from "../auth/tokens.js";
import { config } from "../config.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const passwordHash = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashedPassword: passwordHash,
  });

  if (!user) {
    throw new Error("Could not create user");
  }

  const { hashedPassword, ...safeUser } = user;

  res.status(201).json(safeUser);
}

export async function handlerUsersUpdate(req: Request, res: Response) {
  type Parameters = {
    email: string;
    password: string;
  };

  const params: Parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const token = getBearerToken(req);

  const userId = validateJWT(token, config.api.jwtSecret);

  const hashedPassword = await hashPassword(params.password);

  const updatedUser = await updateUser(userId, params.email, hashedPassword);

  if (!updatedUser) {
    throw new UnauthorizedError("User not found");
  }

  const { hashedPassword: _, ...safeUser } = updatedUser;

  res.status(200).json(safeUser);
}
