import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import { UnauthorizedError } from "../errors/errors.js";

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
