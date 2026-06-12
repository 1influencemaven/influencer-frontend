/**
 * @jest-environment node
 */

import { createCreateUserSchema } from "@/schemas/create-user.schema";

const messages = {
  nameRequired: "Name required",
  nameMin: "Name min",
  nameMax: "Name max",
  emailRequired: "Email required",
  emailInvalid: "Email invalid",
  passwordRequired: "Password required",
  passwordMin: "Password min",
  roleRequired: "Role required",
};

describe("createCreateUserSchema", () => {
  const schema = createCreateUserSchema(messages);

  it("accepts valid user input", () => {
    expect(
      schema.safeParse({
        name: "Maria Garcia",
        email: "maria@example.com",
        password: "password123",
        role: "ADMIN",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid names", () => {
    expect(schema.safeParse({
      name: "",
      email: "maria@example.com",
      password: "password123",
      role: "USER",
    }).success).toBe(false);

    expect(schema.safeParse({
      name: "A",
      email: "maria@example.com",
      password: "password123",
      role: "USER",
    }).success).toBe(false);

    expect(schema.safeParse({
      name: "A".repeat(101),
      email: "maria@example.com",
      password: "password123",
      role: "USER",
    }).success).toBe(false);
  });

  it("rejects invalid email and password", () => {
    expect(schema.safeParse({
      name: "Maria Garcia",
      email: "",
      password: "password123",
      role: "USER",
    }).success).toBe(false);

    expect(schema.safeParse({
      name: "Maria Garcia",
      email: "invalid",
      password: "password123",
      role: "USER",
    }).success).toBe(false);

    expect(schema.safeParse({
      name: "Maria Garcia",
      email: "maria@example.com",
      password: "short",
      role: "USER",
    }).success).toBe(false);
  });

  it("rejects invalid roles", () => {
    const result = schema.safeParse({
      name: "Maria Garcia",
      email: "maria@example.com",
      password: "password123",
      role: "SUPERADMIN",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.role).toContain(
        messages.roleRequired,
      );
    }
  });
});
