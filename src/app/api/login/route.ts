import { NextRequest, NextResponse } from "next/server";

import { isValidEmail, MIN_PASSWORD_LENGTH, verifyPassword } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

type LoginUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
};

type LoginPrismaClient = {
  user: {
    findUnique: (args: { where: { email: string } }) => Promise<LoginUserRecord | null>;
  };
};

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

type SuccessResponse = {
  success: true;
  data: {
    id: string;
    email: string;
  };
};

const jsonResponse = (payload: ErrorResponse | SuccessResponse, status: number) => {
  return NextResponse.json(payload, { status });
};

const parseLoginBody = async (
  request: NextRequest,
): Promise<LoginRequestBody | "INVALID_JSON"> => {
  try {
    return (await request.json()) as LoginRequestBody;
  } catch {
    return "INVALID_JSON";
  }
};

export const createLoginHandler =
  (client: LoginPrismaClient) => async (request: NextRequest) => {
    const body = await parseLoginBody(request);
    if (body === "INVALID_JSON") {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Request body must be valid JSON.",
          },
        },
        400,
      );
    }

    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "Email and password are required.",
          },
        },
        400,
      );
    }

    if (!isValidEmail(email)) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "INVALID_EMAIL",
            message: "Email format is invalid.",
          },
        },
        400,
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: "PASSWORD_TOO_SHORT",
            message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
          },
        },
        400,
      );
    }

    try {
      const user = await client.user.findUnique({ where: { email } });
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return jsonResponse(
          {
            success: false,
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Email or password is incorrect.",
            },
          },
          401,
        );
      }

      return jsonResponse(
        {
          success: true,
          data: {
            id: user.id,
            email: user.email,
          },
        },
        200,
      );
    } catch (error) {
      console.error("Login API error:", error);
      return jsonResponse(
        {
          success: false,
          error: {
            code: "SERVER_ERROR",
            message: "Unexpected server error.",
          },
        },
        500,
      );
    }
  };

export const POST = createLoginHandler(prisma);
