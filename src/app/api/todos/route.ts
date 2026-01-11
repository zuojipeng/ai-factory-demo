import { NextResponse } from "next/server";

import { prisma } from "../../../lib/prisma";
import { handleCreateTodo } from "../../../lib/todo";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Request body must be valid JSON.";

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message,
        },
      },
      { status: 400 },
    );
  }

  const result = await handleCreateTodo(payload, prisma);

  return NextResponse.json(result.body, { status: result.status });
}
