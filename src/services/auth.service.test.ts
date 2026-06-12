/**
 * @jest-environment node
 */

jest.mock("../lib/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("../lib/api/refresh-session", () => ({
  refreshSession: jest.fn(),
}));

import apiClient from "@/lib/api/client";
import { refreshSession } from "@/lib/api/refresh-session";
import {
  getAuthErrorMessage,
  login,
  logout,
  me,
  refresh,
} from "@/services/auth.service";
import {
  createApiError,
  createAxiosResponse,
} from "@/services/service-test-utils";

const mockedApiClient = jest.mocked(apiClient);
const mockedRefreshSession = jest.mocked(refreshSession);

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("sends credentials to the login endpoint and returns the response", async () => {
      const credentials = {
        email: "user@example.com",
        password: "password123",
      };
      const response = {
        user: {
          id: "user-1",
          email: credentials.email,
        },
      };

      mockedApiClient.post.mockResolvedValue(createAxiosResponse(response));

      await expect(login(credentials)).resolves.toEqual(response);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        "/auth/login",
        credentials,
      );
    });

    it("propagates api errors", async () => {
      const apiError = createApiError(401, "Invalid credentials");
      mockedApiClient.post.mockRejectedValue(apiError);

      await expect(
        login({
          email: "user@example.com",
          password: "wrong-password",
        }),
      ).rejects.toEqual(apiError);
    });
  });

  describe("logout", () => {
    it("posts to the logout endpoint and returns the response", async () => {
      const response = { message: "Logged out successfully" };
      mockedApiClient.post.mockResolvedValue(createAxiosResponse(response));

      await expect(logout()).resolves.toEqual(response);
      expect(mockedApiClient.post).toHaveBeenCalledWith("/auth/logout");
    });

    it("propagates api errors", async () => {
      const apiError = createApiError(500, "Logout failed");
      mockedApiClient.post.mockRejectedValue(apiError);

      await expect(logout()).rejects.toEqual(apiError);
    });
  });

  describe("refresh", () => {
    it("delegates to refreshSession and returns the refreshed user", async () => {
      const response = {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      };

      mockedRefreshSession.mockResolvedValue(response);

      await expect(refresh()).resolves.toEqual(response);
      expect(mockedRefreshSession).toHaveBeenCalledTimes(1);
    });

    it("propagates refresh errors", async () => {
      const apiError = createApiError(401, "Invalid refresh token");
      mockedRefreshSession.mockRejectedValue(apiError);

      await expect(refresh()).rejects.toEqual(apiError);
    });
  });

  describe("me", () => {
    it("requests the current user and parses the auth payload", async () => {
      mockedApiClient.get.mockResolvedValue(
        createAxiosResponse({
          id: "user-1",
          email: "user@example.com",
          role: "USER",
        }),
      );

      await expect(me()).resolves.toEqual({
        id: "user-1",
        email: "user@example.com",
        role: "USER",
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        "/auth/me",
        expect.objectContaining({
          params: expect.objectContaining({
            _: expect.any(Number),
          }),
          validateStatus: expect.any(Function),
        }),
      );

      const [, config] = mockedApiClient.get.mock.calls[0] ?? [];
      expect(config?.validateStatus?.(200)).toBe(true);
      expect(config?.validateStatus?.(304)).toBe(false);
    });

    it("parses nested user payloads from the backend", async () => {
      mockedApiClient.get.mockResolvedValue(
        createAxiosResponse({
          user: {
            id: "admin-1",
            email: "admin@example.com",
            role: "ADMIN",
          },
        }),
      );

      await expect(me()).resolves.toEqual({
        id: "admin-1",
        email: "admin@example.com",
        role: "ADMIN",
      });
    });

    it("propagates invalid auth payloads as errors", async () => {
      mockedApiClient.get.mockResolvedValue(
        createAxiosResponse({
          id: "user-1",
          email: "user@example.com",
          role: "GUEST",
        }),
      );

      await expect(me()).rejects.toThrow("Invalid auth user response");
    });

    it("propagates api errors", async () => {
      const apiError = createApiError(401, "Unauthorized");
      mockedApiClient.get.mockRejectedValue(apiError);

      await expect(me()).rejects.toEqual(apiError);
    });
  });

  describe("getAuthErrorMessage", () => {
    it("returns api error messages", () => {
      expect(getAuthErrorMessage(createApiError(403, "Forbidden"))).toBe(
        "Forbidden",
      );
    });

    it("returns native error messages", () => {
      expect(getAuthErrorMessage(new Error("Network down"))).toBe(
        "Network down",
      );
    });

    it("returns the default fallback for unknown values", () => {
      expect(getAuthErrorMessage(undefined)).toBe(
        "An unexpected error occurred",
      );
    });
  });
});
