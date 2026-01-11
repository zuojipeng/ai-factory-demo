import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SALT_BYTES = 16;
const KEY_LENGTH = 64;
export const MIN_PASSWORD_LENGTH = 8;

export const hashPassword = (password: string): string => {
  const salt = randomBytes(SALT_BYTES);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `${salt.toString("base64")}:${hash.toString("base64")}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [saltBase64, hashBase64] = storedHash.split(":");
  if (!saltBase64 || !hashBase64) {
    return false;
  }

  try {
    const salt = Buffer.from(saltBase64, "base64");
    const stored = Buffer.from(hashBase64, "base64");
    const derived = scryptSync(password, salt, stored.length);
    return timingSafeEqual(stored, derived);
  } catch {
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  const trimmed = email.trim();
  return trimmed.length > 3 && trimmed.includes("@");
};
