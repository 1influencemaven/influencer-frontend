import apiClient from "@/lib/api/client";
import type {
  CreateUserPayload,
  CreateUserResponse,
} from "@/types/user";

const AUTH_REGISTER_PATH = "/auth/register";

export async function createUser(
  payload: CreateUserPayload,
): Promise<CreateUserResponse> {
  const { data } = await apiClient.post<CreateUserResponse>(
    AUTH_REGISTER_PATH,
    {
      email: payload.email,
      password: payload.password,
      role: payload.role,
    },
  );

  return {
    ...data,
    name: payload.name,
  };
}

export const usersService = {
  createUser,
};
