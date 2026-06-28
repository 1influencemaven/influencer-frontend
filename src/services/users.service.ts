import apiClient from "@/lib/api/client";
import type {
  CreateUserPayload,
  CreateUserResponse,
  DeleteUserResponse,
  UpdateUserPayload,
  User,
} from "@/types/user";

const USERS_PATH = "/users";

export async function listUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>(USERS_PATH);
  return data;
}

export async function getUser(id: string): Promise<User> {
  const { data } = await apiClient.get<User>(`${USERS_PATH}/${id}`);
  return data;
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<CreateUserResponse> {
  const { data } = await apiClient.post<CreateUserResponse>(
    USERS_PATH,
    payload,
  );
  return data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<User> {
  const { data } = await apiClient.patch<User>(`${USERS_PATH}/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<DeleteUserResponse> {
  const { data } = await apiClient.delete<DeleteUserResponse>(
    `${USERS_PATH}/${id}`,
  );
  return data;
}

export const usersService = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
