import { describe, expect, it } from "vitest";

import { handleCreateTodo, TodoPrismaClient, TodoRecord } from "./todo";

const makeTodo = (overrides: Partial<TodoRecord> = {}): TodoRecord => ({
  id: "todo_1",
  title: "Prepare release notes",
  description: null,
  completed: false,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

describe("handleCreateTodo", () => {
  it("creates a todo with valid payload", async () => {
    const prisma: TodoPrismaClient = {
      todo: {
        create: async () => makeTodo(),
      },
    };

    const result = await handleCreateTodo({ title: "Ship v1" }, prisma);

    expect(result.status).toBe(201);
    expect(result.body.success).toBe(true);

    if (result.body.success) {
      expect(result.body.data.title).toBe("Prepare release notes");
    }
  });

  it("rejects empty titles", async () => {
    const prisma: TodoPrismaClient = {
      todo: {
        create: async () => makeTodo(),
      },
    };

    const result = await handleCreateTodo({ title: "   " }, prisma);

    expect(result.status).toBe(400);
    expect(result.body.success).toBe(false);

    if (!result.body.success) {
      expect(result.body.error.code).toBe("INVALID_TITLE");
    }
  });

  it("rejects titles that exceed the maximum length", async () => {
    const prisma: TodoPrismaClient = {
      todo: {
        create: async () => makeTodo(),
      },
    };

    const result = await handleCreateTodo(
      { title: "a".repeat(201) },
      prisma,
    );

    expect(result.status).toBe(400);
    expect(result.body.success).toBe(false);

    if (!result.body.success) {
      expect(result.body.error.code).toBe("TITLE_TOO_LONG");
    }
  });

  it("returns server errors when persistence fails", async () => {
    const prisma: TodoPrismaClient = {
      todo: {
        create: async () => {
          throw new Error("Database unavailable");
        },
      },
    };

    const result = await handleCreateTodo({ title: "Ship v1" }, prisma);

    expect(result.status).toBe(500);
    expect(result.body.success).toBe(false);

    if (!result.body.success) {
      expect(result.body.error.code).toBe("INTERNAL_SERVER_ERROR");
    }
  });
});
