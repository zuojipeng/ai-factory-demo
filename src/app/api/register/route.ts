import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { randomBytes, createHash } from "node:crypto";

import { prisma } from "../../../lib/prisma";
import { validateRegistrationPayload } from "../../../lib/registration";

const hashPassword = (password: string): { hash: string; salt: string } => {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return { hash, salt };
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 },
    );
  }

  const validationResult = validateRegistrationPayload(payload);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: validationResult.error,
      },
      { status: 400 },
    );
  }

  const { email, password, name } = validationResult.data;
  const { hash, salt } = hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        passwordHash: hash,
        passwordSalt: salt,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "An account with this email already exists.",
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Unable to register user.",
        },
      },
      { status: 500 },
    );
  }
}
