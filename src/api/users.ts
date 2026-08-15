import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  const email = req.body.email;

  const user = await createUser({
    email: email,
  });
  
  res.status(201).json(user);
}
