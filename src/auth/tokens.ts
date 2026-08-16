import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { type Request, type Response } from "express";
import { UnauthorizedError } from "../errors/errors.js";
import { randomBytes } from "node:crypto";

const TOKEN_ISSUER = "chirpy";
const TOKEN_ALGORITHM = "HS256";

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string,
): string {
  const iat = Math.floor(Date.now() / 1000);

  const payload: Payload = {
    iss: TOKEN_ISSUER,
    sub: userID,
    iat,
    exp: iat + expiresIn,
  };

  return jwt.sign(payload, secret, {
    algorithm: TOKEN_ALGORITHM,
  });
}

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const payload = jwt.verify(tokenString, secret, {
      algorithms: [TOKEN_ALGORITHM],
    });

    if (typeof payload === "string") {
      throw new UnauthorizedError("Invalid token");
    }

    if (payload.iss !== TOKEN_ISSUER || !payload.sub) {
      throw new UnauthorizedError("Invalid token");
    }

    return payload.sub;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    throw new UnauthorizedError("Missing Authorization header");
  }

  const parts = authHeader.trim().split(/\s+/);

  if (parts[0] !== "Bearer") {
    throw new UnauthorizedError("Invalid authorization scheme");
  }

  if (!parts[1]) {
    throw new UnauthorizedError("Missing bearer token");
  }

  if (parts.length !== 2) {
    throw new UnauthorizedError("Invalid Authorization header");
  }

  return parts[1];
}

export function makeRefreshToken() : string {
  return randomBytes(32).toString('hex');
}
