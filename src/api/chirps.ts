import type { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../errors/errors.js";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirps.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type Parameters = {
    body: string;
    userId: string;
  };

  const maxChirpLength = 140;
  const params: Parameters = req.body;

  if (params.body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  let wordsOfBody = params.body.split(" ");
  const badWords = new Set(["kerfuffle", "sharbert", "fornax"]);

  const cleanedWords = wordsOfBody.map((word) => {
    return badWords.has(word.toLowerCase()) ? "****" : word;
  });

  params.body = cleanedWords.join(" ");

  const createdChirp = await createChirp({
    body: params.body,
    userId: params.userId,
  });

  res.status(201).json(createdChirp);
}

export async function handlerChirpsGet(req: Request, res: Response) {
  const chirps = await getChirps();
  res.status(200).json(chirps);
}

export async function handlerChirpsGetOne(
  req: Request<{ chirpId: string }>,
  res: Response,
) {
  const chirp = await getChirpById(req.params.chirpId);
  if (!chirp) {
    throw new NotFoundError("Chirp not found !");
  }
  res.status(200).json(chirp);
}
