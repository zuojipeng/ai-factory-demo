import assert from "node:assert/strict";
import test from "node:test";

import { NextRequest } from "next/server";

import { hashPassword, MIN_PASSWORD_LENGTH } from "../../../lib/auth";

import { createLoginHandler } from "./route";

const createRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

const createInvalidJsonRequest = (body: string) =>
  new NextRequest("http://localhost/api/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
  });

test("login succeeds with valid credentials", async () => {
  const user = {
    id: "user-123",
    email: "user@example.com",
    passwordHash: hashPassword("password123"),
  };

  const handler = createLoginHandler({
    user: {
      findUnique: async ({ where }) => (where.email === user.email ? user : null),
    },
  });

  const response = await handler(createRequest({ email: user.email, password: "password123" }));
  const payload = (await response.json()) as { success: boolean; data?: { id: string } };

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data?.id, user.id);
});

test("login returns 401 for invalid password", async () => {
  const user = {
    id: "user-456",
    email: "user2@example.com",
    passwordHash: hashPassword("password123"),
  };

  const handler = createLoginHandler({
    user: {
      findUnique: async ({ where }) => (where.email === user.email ? user : null),
    },
  });

  const response = await handler(createRequest({ email: user.email, password: "wrong-pass" }));
  const payload = (await response.json()) as { success: boolean; error?: { code: string } };

  assert.equal(response.status, 401);
  assert.equal(payload.success, false);
  assert.equal(payload.error?.code, "INVALID_CREDENTIALS");
});

test("login returns 400 for short password boundary", async () => {
  const handler = createLoginHandler({
    user: {
      findUnique: async () => null,
    },
  });

  const response = await handler(
    createRequest({ email: "user@example.com", password: "x".repeat(MIN_PASSWORD_LENGTH - 1) }),
  );
  const payload = (await response.json()) as { success: boolean; error?: { code: string } };

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.error?.code, "PASSWORD_TOO_SHORT");
});

test("login returns 400 for invalid JSON", async () => {
  const handler = createLoginHandler({
    user: {
      findUnique: async () => null,
    },
  });

  const response = await handler(createInvalidJsonRequest("{not-json"));
  const payload = (await response.json()) as { success: boolean; error?: { code: string } };

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.error?.code, "INVALID_JSON");
});
