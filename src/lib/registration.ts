export type RegistrationPayload = {
  email: string;
  password: string;
  name?: string;
};

type ValidationSuccess = {
  success: true;
  data: RegistrationPayload;
};

type ValidationError = {
  success: false;
  error: {
    code: "INVALID_PAYLOAD" | "INVALID_EMAIL" | "INVALID_PASSWORD" | "INVALID_NAME";
    message: string;
  };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const MAX_NAME_LENGTH = 50;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const validateRegistrationPayload = (
  payload: unknown,
): ValidationSuccess | ValidationError => {
  if (!isRecord(payload)) {
    return {
      success: false,
      error: {
        code: "INVALID_PAYLOAD",
        message: "Request body must be a JSON object.",
      },
    };
  }

  const email = payload.email;
  const password = payload.password;
  const name = payload.name;

  if (typeof email !== "string" || email.trim().length === 0) {
    return {
      success: false,
      error: {
        code: "INVALID_EMAIL",
        message: "Email is required.",
      },
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      success: false,
      error: {
        code: "INVALID_EMAIL",
        message: "Email format is invalid.",
      },
    };
  }

  if (typeof password !== "string") {
    return {
      success: false,
      error: {
        code: "INVALID_PASSWORD",
        message: "Password is required.",
      },
    };
  }

  const trimmedPassword = password.trim();
  if (
    trimmedPassword.length < MIN_PASSWORD_LENGTH ||
    trimmedPassword.length > MAX_PASSWORD_LENGTH
  ) {
    return {
      success: false,
      error: {
        code: "INVALID_PASSWORD",
        message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
      },
    };
  }

  if (typeof name !== "undefined") {
    if (typeof name !== "string") {
      return {
        success: false,
        error: {
          code: "INVALID_NAME",
          message: "Name must be a string.",
        },
      };
    }

    if (name.trim().length > MAX_NAME_LENGTH) {
      return {
        success: false,
        error: {
          code: "INVALID_NAME",
          message: `Name must be at most ${MAX_NAME_LENGTH} characters.`,
        },
      };
    }
  }

  return {
    success: true,
    data: {
      email: email.trim().toLowerCase(),
      password: trimmedPassword,
      name: typeof name === "string" && name.trim().length > 0 ? name.trim() : undefined,
    },
  };
};
