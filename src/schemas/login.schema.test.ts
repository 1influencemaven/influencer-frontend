/**
 * @jest-environment node
 */

import { createLoginSchema } from "@/schemas/login.schema";

const messages = {
  emailRequired: "Email required",
  emailInvalid: "Email invalid",
  passwordRequired: "Password required",
  passwordMin: "Password min",
};

describe("createLoginSchema", () => {
  const schema = createLoginSchema(messages);

  it("accepts valid credentials", () => {
    expect(
      schema.safeParse({
        email: "user@example.com",
        password: "password123",
      }).success,
    ).toBe(true);
  });

  it("rejects missing email", () => {
    const result = schema.safeParse({ email: "", password: "password123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain(
        messages.emailRequired,
      );
    }
  });

  it("rejects invalid email", () => {
    const result = schema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain(
        messages.emailInvalid,
      );
    }
  });

  it("rejects short passwords", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain(
        messages.passwordMin,
      );
    }
  });

  it("rejects missing password", () => {
    const result = schema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain(
        messages.passwordRequired,
      );
    }
  });
});
