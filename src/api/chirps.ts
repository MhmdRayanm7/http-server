import type { Request, Response } from "express";

export async function handlerChirpsValidate(req: Request, res: Response) {
  type Parameters = {
    body: string;
  };

  const maxChirpLength = 140;
  const params: Parameters = req.body;

  if (params.body.length > maxChirpLength) {
     throw new Error("Chirp is too long");
  }

  let wordsOfBody = params.body.split(" ");
  const badWords = new Set(["kerfuffle", "sharbert", "fornax"]);

  const cleanedWords = wordsOfBody.map((word) => {
    return badWords.has(word.toLowerCase()) ? "****" : word;
  });

  params.body = cleanedWords.join(" ");

  res.status(200).json({
    cleanedBody: params.body,
  });
}
