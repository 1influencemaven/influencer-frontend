import apiClient from "@/lib/api/client";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
} from "@/types/auth";
import { isApiError } from "@/types/api-error";

const AUTH_BASE_PATH = "/auth";

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    `${AUTH_BASE_PATH}/login`,
    credentials,
  );

  return data;
}

export async function logout(): Promise<LogoutResponse> {
  const { data } = await apiClient.post<LogoutResponse>(
    `${AUTH_BASE_PATH}/logout`,
  );

  return data;
}

export async function me(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>(`${AUTH_BASE_PATH}/me`);

  return data;
}

export function getAuthErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

export const authService = {
  login,
  logout,
  me,
  getAuthErrorMessage,
};
