/**
 * @jest-environment node
 */

import {
  getApiErrorMessage,
  isApiError,
  toApiError,
  type ApiError,
} from "@/types/api-error";

describe("api-error", () => {
  describe("isApiError", () => {
    it("detects normalized api errors", () => {
      const error: ApiError = { status: 401, message: "Unauthorized" };
      expect(isApiError(error)).toBe(true);
    });

    it("rejects non-api errors", () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError({ status: "401", message: "Unauthorized" })).toBe(
        false,
      );
    });
  });

  describe("toApiError", () => {
    it("returns the same normalized error", () => {
      const error: ApiError = { status: 400, message: "Bad request" };
      expect(toApiError(error)).toBe(error);
    });

    it("maps axios-like errors", () => {
      expect(
        toApiError({
          isAxiosError: true,
          message: "Network Error",
          response: {
            status: 422,
            data: { message: "Validation failed", code: "VALIDATION" },
          },
        }),
      ).toEqual({
        status: 422,
        message: "Validation failed",
        code: "VALIDATION",
        data: { message: "Validation failed", code: "VALIDATION" },
      });
    });

    it("falls back to the axios message when response data is not an object", () => {
      expect(
        toApiError({
          isAxiosError: true,
          message: "Request failed with status 500",
          response: {
            status: 500,
            data: "Server exploded",
          },
        }),
      ).toEqual({
        status: 500,
        message: "Request failed with status 500",
        code: undefined,
        data: "Server exploded",
      });
    });

    it("uses the default request failed message for axios errors without details", () => {
      expect(
        toApiError({
          isAxiosError: true,
          message: "Network Error",
        }),
      ).toEqual({
        status: 0,
        message: "Network Error",
        code: undefined,
        data: undefined,
      });
    });

    it("falls back to axios message and error field", () => {
      expect(
        toApiError({
          isAxiosError: true,
          message: "Request failed with status 500",
          response: {
            status: 500,
            data: { error: "Server exploded" },
          },
        }),
      ).toEqual({
        status: 500,
        message: "Server exploded",
        code: undefined,
        data: { error: "Server exploded" },
      });
    });

    it("maps generic errors and unknown values", () => {
      expect(toApiError(new Error("Boom"))).toEqual({
        status: 0,
        message: "Boom",
      });
      expect(toApiError("unexpected")).toEqual({
        status: 0,
        message: "Unknown error",
      });
    });
  });

  describe("getApiErrorMessage", () => {
    it("returns api error messages", () => {
      expect(
        getApiErrorMessage({ status: 403, message: "Forbidden" }),
      ).toBe("Forbidden");
    });

    it("returns native error messages", () => {
      expect(getApiErrorMessage(new Error("Native"))).toBe("Native");
    });

    it("returns the fallback for unknown values", () => {
      expect(getApiErrorMessage(undefined)).toBe(
        "An unexpected error occurred",
      );
      expect(getApiErrorMessage(undefined, "Fallback")).toBe("Fallback");
    });
  });
});
