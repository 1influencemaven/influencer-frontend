/**
 * @jest-environment node
 */

import {
  createCreateUserSchema,
  type CreateUserFormValues,
} from "@/schemas/create-user.schema";
import {
  expectFieldError,
  expectParseFailure,
  expectParseSuccess,
  expectRequiredFieldFailure,
} from "@/schemas/schema-test-utils";

const messages = {
  nameRequired: "Name required",
  nameMin: "Name min",
  nameMax: "Name max",
  emailRequired: "Email required",
  emailInvalid: "Email invalid",
  passwordRequired: "Password required",
  passwordMin: "Password min",
  roleRequired: "Role required",
} as const;

const validInput: CreateUserFormValues = {
  name: "Maria Garcia",
  email: "maria@example.com",
  password: "password123",
  role: "USER",
};

describe("createCreateUserSchema (register form)", () => {
  const schema = createCreateUserSchema(messages);

  describe("valid cases", () => {
    it("accepts valid user registration input", () => {
      const result = schema.safeParse(validInput);
      expectParseSuccess(result);
      expect(result.data).toEqual(validInput);
    });

    it("accepts admin registration input", () => {
      expectParseSuccess(
        schema.safeParse({
          ...validInput,
          role: "ADMIN",
        }),
      );
    });

    it("accepts boundary name lengths", () => {
      expectParseSuccess(
        schema.safeParse({
          ...validInput,
          name: "Ab",
        }),
      );

      expectParseSuccess(
        schema.safeParse({
          ...validInput,
          name: "A".repeat(100),
        }),
      );
    });

    it("accepts the minimum password length", () => {
      expectParseSuccess(
        schema.safeParse({
          ...validInput,
          password: "12345678",
        }),
      );
    });
  });

  describe("required fields", () => {
    it("rejects missing name", () => {
      expectRequiredFieldFailure(
        schema.safeParse({
          email: validInput.email,
          password: validInput.password,
          role: validInput.role,
        }),
        "name",
      );
    });

    it("rejects missing email", () => {
      expectRequiredFieldFailure(
        schema.safeParse({
          name: validInput.name,
          password: validInput.password,
          role: validInput.role,
        }),
        "email",
      );
    });

    it("rejects missing password", () => {
      expectRequiredFieldFailure(
        schema.safeParse({
          name: validInput.name,
          email: validInput.email,
          role: validInput.role,
        }),
        "password",
      );
    });

    it("rejects missing role", () => {
      expectRequiredFieldFailure(
        schema.safeParse({
          name: validInput.name,
          email: validInput.email,
          password: validInput.password,
        }),
        "role",
      );
    });

    it("rejects empty required strings", () => {
      expectFieldError(
        schema.safeParse({
          name: "",
          email: "maria@example.com",
          password: "password123",
          role: "USER",
        }),
        "name",
        messages.nameRequired,
      );

      expectFieldError(
        schema.safeParse({
          name: validInput.name,
          email: "",
          password: "password123",
          role: "USER",
        }),
        "email",
        messages.emailRequired,
      );

      expectFieldError(
        schema.safeParse({
          name: validInput.name,
          email: validInput.email,
          password: "",
          role: "USER",
        }),
        "password",
        messages.passwordRequired,
      );
    });

    it("rejects completely empty payloads", () => {
      expectParseFailure(schema.safeParse({}));
    });
  });

  describe("invalid formats", () => {
    it.each([
      "invalid",
      "user@",
      "@example.com",
      "user@.com",
    ])("rejects invalid email: %s", (email) => {
      expectFieldError(
        schema.safeParse({
          ...validInput,
          email,
        }),
        "email",
        messages.emailInvalid,
      );
    });

    it("rejects unsupported roles", () => {
      expectFieldError(
        schema.safeParse({
          ...validInput,
          role: "SUPERADMIN",
        }),
        "role",
        messages.roleRequired,
      );
    });
  });

  describe("min/max limits", () => {
    it("rejects names shorter than 2 characters", () => {
      expectFieldError(
        schema.safeParse({
          ...validInput,
          name: "A",
        }),
        "name",
        messages.nameMin,
      );
    });

    it("rejects names longer than 100 characters", () => {
      expectFieldError(
        schema.safeParse({
          ...validInput,
          name: "A".repeat(101),
        }),
        "name",
        messages.nameMax,
      );
    });

    it("rejects passwords shorter than 8 characters", () => {
      expectFieldError(
        schema.safeParse({
          ...validInput,
          password: "1234567",
        }),
        "password",
        messages.passwordMin,
      );
    });

    it("accepts passwords with exactly 8 characters", () => {
      expectParseSuccess(
        schema.safeParse({
          ...validInput,
          password: "12345678",
        }),
      );
    });
  });
});
