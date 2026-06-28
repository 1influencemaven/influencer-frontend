/**
 * @jest-environment node
 */

jest.mock("../lib/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import apiClient from "@/lib/api/client";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "@/services/users.service";
import {
  createApiError,
  createAxiosResponse,
} from "@/services/service-test-utils";

const mockedApiClient = jest.mocked(apiClient);

describe("users.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listUsers", () => {
    it("fetches all users from the users endpoint", async () => {
      const users = [
        {
          id: "user-1",
          name: "Jane Doe",
          email: "jane@example.com",
          role: "USER",
        },
      ];

      mockedApiClient.get.mockResolvedValue(createAxiosResponse(users));

      await expect(listUsers()).resolves.toEqual(users);
      expect(mockedApiClient.get).toHaveBeenCalledWith("/users");
    });
  });

  describe("getUser", () => {
    it("fetches a single user by id", async () => {
      const user = {
        id: "user-1",
        name: "Jane Doe",
        email: "jane@example.com",
        role: "USER",
      };

      mockedApiClient.get.mockResolvedValue(createAxiosResponse(user));

      await expect(getUser("user-1")).resolves.toEqual(user);
      expect(mockedApiClient.get).toHaveBeenCalledWith("/users/user-1");
    });
  });

  describe("createUser", () => {
    const payload = {
      name: "Maria Garcia",
      email: "maria@example.com",
      password: "password123",
      role: "ADMIN" as const,
    };

    it("creates a user through the users endpoint", async () => {
      mockedApiClient.post.mockResolvedValue(
        createAxiosResponse({
          id: "user-1",
          name: payload.name,
          email: payload.email,
          role: payload.role,
        }),
      );

      await expect(createUser(payload)).resolves.toEqual({
        id: "user-1",
        name: payload.name,
        email: payload.email,
        role: payload.role,
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith("/users", payload);
    });

    it("propagates api errors", async () => {
      const apiError = createApiError(409, "Email already exists");
      mockedApiClient.post.mockRejectedValue(apiError);

      await expect(createUser(payload)).rejects.toEqual(apiError);
    });
  });

  describe("updateUser", () => {
    it("patches a user by id", async () => {
      const payload = {
        name: "Updated Name",
        email: "updated@example.com",
        role: "ADMIN" as const,
      };

      mockedApiClient.patch.mockResolvedValue(
        createAxiosResponse({
          id: "user-1",
          ...payload,
        }),
      );

      await expect(updateUser("user-1", payload)).resolves.toEqual({
        id: "user-1",
        ...payload,
      });

      expect(mockedApiClient.patch).toHaveBeenCalledWith(
        "/users/user-1",
        payload,
      );
    });
  });

  describe("deleteUser", () => {
    it("deletes a user by id", async () => {
      mockedApiClient.delete.mockResolvedValue(
        createAxiosResponse({ message: "User deleted successfully" }),
      );

      await expect(deleteUser("user-1")).resolves.toEqual({
        message: "User deleted successfully",
      });

      expect(mockedApiClient.delete).toHaveBeenCalledWith("/users/user-1");
    });
  });
});
