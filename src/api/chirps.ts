import type { Request, Response } from "express";

export function handlerChirpsValidate(req: Request, res: Response) {
  type Parameters  = {
    body: string;
  };

  const maxChirpLength = 140;
  const params: Parameters  = req.body;

  if (params.body.length > maxChirpLength) {
    res.status(400).json({
      error: "Chirp is too long",
    });
    return;
  }

  res.status(200).json({
    valid: true,
  });
}
