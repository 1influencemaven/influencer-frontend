/**
 * @jest-environment node
 */

import {
  createLoginSchema,
  type LoginFormValues,
} from "@/schemas/login.schema";
import {
  expectFieldError,
  expectParseFailure,
  expectParseSuccess,
  expectRequiredFieldFailure,
} from "@/schemas/schema-test-utils";

const messages = {
  emailRequired: "Email required",
  emailInvalid: "Email invalid",
  passwordRequired: "Password required",
  passwordMin: "Password min",
} as const;

const validInput: LoginFormValues = {
  email: "user@example.com",
  password: "password123",
};

describe("createLoginSchema", () => {
  const schema = createLoginSchema(messages);

  describe("valid cases", () => {
    it("accepts valid credentials", () => {
      const result = schema.safeParse(validInput);
      expectParseSuccess(result);
      expect(result.data).toEqual(validInput);
    });

    it("accepts the minimum password length", () => {
      const result = schema.safeParse({
        email: "user@example.com",
        password: "12345678",
      });

      expectParseSuccess(result);
    });

    it("accepts common email formats", () => {
      const emails = [
        "user@example.com",
        "user.name+tag@sub.example.co.uk",
      ];

      for (const email of emails) {
        expectParseSuccess(
          schema.safeParse({ email, password: "password123" }),
        );
      }
    });
  });

  describe("required fields", () => {
    it("rejects missing email", () => {
      expectRequiredFieldFailure(
        schema.safeParse({ password: "password123" }),
        "email",
      );
    });

    it("rejects empty email", () => {
      expectFieldError(
        schema.safeParse({ email: "", password: "password123" }),
        "email",
        messages.emailRequired,
      );
    });

    it("rejects missing password", () => {
      expectRequiredFieldFailure(
        schema.safeParse({ email: "user@example.com" }),
        "password",
      );
    });

    it("rejects empty password", () => {
      expectFieldError(
        schema.safeParse({ email: "user@example.com", password: "" }),
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
      "not-an-email",
      "user@",
      "@example.com",
      "user@.com",
      "user example.com",
    ])("rejects invalid email: %s", (email) => {
      expectFieldError(
        schema.safeParse({ email, password: "password123" }),
        "email",
        messages.emailInvalid,
      );
    });
  });

  describe("min/max limits", () => {
    it("rejects passwords shorter than 8 characters", () => {
      expectFieldError(
        schema.safeParse({
          email: "user@example.com",
          password: "1234567",
        }),
        "password",
        messages.passwordMin,
      );
    });

    it("accepts passwords with exactly 8 characters", () => {
      expectParseSuccess(
        schema.safeParse({
          email: "user@example.com",
          password: "12345678",
        }),
      );
    });
  });
});
