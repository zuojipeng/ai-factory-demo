import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { validateRegistrationPayload } from "./registration";

describe("validateRegistrationPayload", () => {
  it("accepts a valid payload", () => {
    const result = validateRegistrationPayload({
      email: "test@example.com",
      password: "securepass",
      name: "Ada Lovelace",
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "test@example.com");
      assert.equal(result.data.password, "securepass");
      assert.equal(result.data.name, "Ada Lovelace");
    }
  });

  it("rejects missing email", () => {
    const result = validateRegistrationPayload({
      password: "securepass",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.code, "INVALID_EMAIL");
    }
  });

  it("handles boundary password lengths", () => {
    const minPassword = "a".repeat(8);
    const maxPassword = "b".repeat(72);
    const overMaxPassword = "c".repeat(73);

    const minResult = validateRegistrationPayload({
      email: "min@example.com",
      password: minPassword,
    });
    assert.equal(minResult.success, true);

    const maxResult = validateRegistrationPayload({
      email: "max@example.com",
      password: maxPassword,
    });
    assert.equal(maxResult.success, true);

    const overMaxResult = validateRegistrationPayload({
      email: "over@example.com",
      password: overMaxPassword,
    });
    assert.equal(overMaxResult.success, false);
  });
});
