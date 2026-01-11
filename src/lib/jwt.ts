import { jwtVerify, JWTPayload } from "jose";

const TOKEN_COOKIE_NAME = "token";
const BEARER_PREFIX = "Bearer ";

const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
};

export const extractToken = (authorizationHeader: string | null, cookieToken?: string): string | null => {
  if (authorizationHeader && authorizationHeader.startsWith(BEARER_PREFIX)) {
    return authorizationHeader.slice(BEARER_PREFIX.length).trim();
  }

  if (cookieToken) {
    return cookieToken;
  }

  return null;
};

export const getTokenCookieName = (): string => TOKEN_COOKIE_NAME;

export const verifyJwt = async (token: string): Promise<JWTPayload> => {
  const secret = getJwtSecret();
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  return payload;
};
