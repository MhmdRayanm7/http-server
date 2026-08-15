import { describe, it, expect, beforeAll } from "vitest";
import type { Request } from "express";
import { hashPassword, checkPasswordHash } from "./passwords.js";
import { getBearerToken, makeJWT, validateJWT } from "./tokens.js";
import { UnauthorizedError } from "../errors/errors.js";

describe("Password Hashing", () => {
  const password = "correctPassword123!";
  let hash: string;

  beforeAll(async () => {
    hash = await hashPassword(password);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password, hash);

    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash("wrongPassword", hash);

    expect(result).toBe(false);
  });

  it("should return false for an invalid hash", async () => {
    const result = await checkPasswordHash(password, "invalid-hash");

    expect(result).toBe(false);
  });
});

describe("JWT", () => {
  const userID = "user-123";
  const secret = "test-secret";
  const wrongSecret = "wrong-secret";

  let validToken: string;

  beforeAll(() => {
    validToken = makeJWT(userID, 3600, secret);
  });

  it("should create and validate a JWT", () => {
    const result = validateJWT(validToken, secret);

    expect(result).toBe(userID);
  });

  it("should reject an expired token", () => {
    const expiredToken = makeJWT(userID, -1, secret);

    expect(() => {
      validateJWT(expiredToken, secret);
    }).toThrow(UnauthorizedError);
  });

  it("should reject a token signed with the wrong secret", () => {
    expect(() => {
      validateJWT(validToken, wrongSecret);
    }).toThrow(UnauthorizedError);
  });

  it("should reject an invalid token", () => {
    expect(() => {
      validateJWT("invalid.token.string", secret);
    }).toThrow(UnauthorizedError);
  });
});

describe("getBearerToken", () => {
  it("should return the token from a valid Bearer header", () => {
    const req = {
      get: () => "Bearer test-token-123",
    } as unknown as Request;

    const token = getBearerToken(req);

    expect(token).toBe("test-token-123");
  });

  it("should throw when the Authorization header is missing", () => {
    const req = {
      get: () => undefined,
    } as unknown as Request;

    expect(() => {
      getBearerToken(req);
    }).toThrow(UnauthorizedError);
  });

  it("should throw when the authorization scheme is not Bearer", () => {
    const req = {
      get: () => "Basic abc123",
    } as unknown as Request;

    expect(() => {
      getBearerToken(req);
    }).toThrow(UnauthorizedError);
  });

  it("should handle extra whitespace in the Authorization header", () => {
    const req = {
      get: () => "   Bearer     test-token-123   ",
    } as unknown as Request;

    const token = getBearerToken(req);

    expect(token).toBe("test-token-123");
  });
});
