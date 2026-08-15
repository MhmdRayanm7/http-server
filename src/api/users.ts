import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "../errors/errors.js";
import { hashPassword } from "../auth/passwords.js";

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
