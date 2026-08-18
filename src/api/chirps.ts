import type { Request, Response } from "express";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/errors.js";
import {
  createChirp,
  deleteChirp,
  getChirpById,
  getChirps,
} from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth/tokens.js";
import { config } from "../config.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type Parameters = {
    body: string;
  };

  const maxChirpLength = 140;
  const token = getBearerToken(req);
  const params: Parameters = req.body;

  const userId = validateJWT(token, config.api.jwtSecret);

  if (params.body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  const wordsOfBody = params.body.split(" ");
  const badWords = new Set(["kerfuffle", "sharbert", "fornax"]);

  const cleanedWords = wordsOfBody.map((word) => {
    return badWords.has(word.toLowerCase()) ? "****" : word;
  });

  const cleanedBody = cleanedWords.join(" ");

  const createdChirp = await createChirp({
    body: cleanedBody,
    userId,
  });

  res.status(201).json(createdChirp);
}

export async function handlerChirpsGet(req: Request, res: Response) {
  const authorIdQuery = req.query.authorId;
  let authorId: string | undefined;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }
  const chirps = await getChirps(authorId);
  res.status(200).json(chirps);
}

export async function handlerChirpsGetOne(
  req: Request<{ chirpId: string }>,
  res: Response,
) {
  if (typeof req.params.chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID");
  }

  const chirp = await getChirpById(req.params.chirpId);
  if (!chirp) {
    throw new NotFoundError("Chirp not found !");
  }

  res.status(200).json(chirp);
}

export async function handlerChirpsDelete(
  req: Request<{ chirpId: string }>,
  res: Response,
) {
  const token = getBearerToken(req);
  const authenticatedUserId = validateJWT(token, config.api.jwtSecret);

  const chirp = await getChirpById(req.params.chirpId);

  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  if (chirp.userId !== authenticatedUserId) {
    throw new ForbiddenError("You are not allowed to delete this chirp");
  }

  await deleteChirp(chirp.id);

  res.status(204).send();
}
