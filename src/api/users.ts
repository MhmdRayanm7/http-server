import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "../errors/errors.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await createUser({
    email: params.email,
  });

  if (!user) {
    throw new Error("Could not create user");
  }

  res.status(201).json(user);
}
