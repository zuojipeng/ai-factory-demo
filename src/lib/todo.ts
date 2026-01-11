export type ApiError = {
  code: string;
  message: string;
};

export type ApiFailure = {
  success: false;
  error: ApiError;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type CreateTodoInput = {
  title: string;
  description?: string | null;
};

export type TodoRecord = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TodoCreateData = {
  title: string;
  description: string | null;
  completed: boolean;
};

export type TodoModelClient = {
  create: (args: { data: TodoCreateData }) => Promise<TodoRecord>;
};

export type TodoPrismaClient = {
  todo: TodoModelClient;
};

export type CreateTodoResult = {
  status: number;
  body: ApiSuccess<TodoRecord> | ApiFailure;
};

const TITLE_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 500;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const buildError = (code: string, message: string): ApiFailure => ({
  success: false,
  error: {
    code,
    message,
  },
});

const parseCreateTodoInput = (
  payload: unknown,
): { ok: true; data: CreateTodoInput } | { ok: false; error: ApiFailure } => {
  if (!isRecord(payload)) {
    return {
      ok: false,
      error: buildError("INVALID_BODY", "Request body must be an object."),
    };
  }

  const titleValue = payload.title;
  if (typeof titleValue !== "string") {
    return {
      ok: false,
      error: buildError("INVALID_TITLE", "Title is required."),
    };
  }

  const trimmedTitle = titleValue.trim();
  if (trimmedTitle.length === 0) {
    return {
      ok: false,
      error: buildError("INVALID_TITLE", "Title cannot be empty."),
    };
  }

  if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    return {
      ok: false,
      error: buildError(
        "TITLE_TOO_LONG",
        `Title must be at most ${TITLE_MAX_LENGTH} characters.`,
      ),
    };
  }

  const descriptionValue = payload.description;
  if (
    typeof descriptionValue !== "undefined" &&
    descriptionValue !== null &&
    typeof descriptionValue !== "string"
  ) {
    return {
      ok: false,
      error: buildError(
        "INVALID_DESCRIPTION",
        "Description must be a string.",
      ),
    };
  }

  if (
    typeof descriptionValue === "string" &&
    descriptionValue.length > DESCRIPTION_MAX_LENGTH
  ) {
    return {
      ok: false,
      error: buildError(
        "DESCRIPTION_TOO_LONG",
        `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`,
      ),
    };
  }

  return {
    ok: true,
    data: {
      title: trimmedTitle,
      description:
        typeof descriptionValue === "undefined" ? null : descriptionValue,
    },
  };
};

export const handleCreateTodo = async (
  payload: unknown,
  prismaClient: TodoPrismaClient,
): Promise<CreateTodoResult> => {
  const parsed = parseCreateTodoInput(payload);

  if (!parsed.ok) {
    return {
      status: 400,
      body: parsed.error,
    };
  }

  try {
    const todo = await prismaClient.todo.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        completed: false,
      },
    });

    return {
      status: 201,
      body: {
        success: true,
        data: todo,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return {
      status: 500,
      body: buildError("INTERNAL_SERVER_ERROR", message),
    };
  }
};
