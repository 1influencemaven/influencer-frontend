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

import apiClient from "@/lib/api/client";
import { createUser } from "@/services/users.service";
import {
  createApiError,
  createAxiosResponse,
} from "@/services/service-test-utils";

const mockedApiClient = jest.mocked(apiClient);

describe("users.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    const payload = {
      name: "Maria Garcia",
      email: "maria@example.com",
      password: "password123",
      role: "ADMIN" as const,
    };

    it("registers a user with the backend payload and merges the local name", async () => {
      mockedApiClient.post.mockResolvedValue(
        createAxiosResponse({
          id: "user-1",
          email: payload.email,
          role: payload.role,
        }),
      );

      await expect(createUser(payload)).resolves.toEqual({
        id: "user-1",
        email: payload.email,
        role: payload.role,
        name: payload.name,
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith("/auth/register", {
        email: payload.email,
        password: payload.password,
        role: payload.role,
      });
    });

    it("does not send the display name to the backend", async () => {
      mockedApiClient.post.mockResolvedValue(
        createAxiosResponse({
          id: "user-2",
          email: payload.email,
          role: "USER",
        }),
      );

      await createUser({
        ...payload,
        role: "USER",
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        "/auth/register",
        expect.not.objectContaining({ name: payload.name }),
      );
    });

    it("propagates api errors", async () => {
      const apiError = createApiError(409, "Email already exists");
      mockedApiClient.post.mockRejectedValue(apiError);

      await expect(createUser(payload)).rejects.toEqual(apiError);
    });
  });
});
