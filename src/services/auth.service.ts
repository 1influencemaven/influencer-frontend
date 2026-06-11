import { parseAuthUser } from "@/lib/auth/parse-auth-user";
import apiClient from "@/lib/api/client";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
} from "@/types/auth";
import { getApiErrorMessage } from "@/types/api-error";

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
  const { data } = await apiClient.get<AuthUser>(`${AUTH_BASE_PATH}/me`, {
    // Avoid 304 Not Modified: axios rejects non-2xx and returns an empty body on 304,
    // which breaks session hydration after a page reload.
    params: { _: Date.now() },
    validateStatus: (status) => status >= 200 && status < 300,
  });

  return parseAuthUser(data);
}

export function getAuthErrorMessage(error: unknown): string {
  return getApiErrorMessage(error);
}

export const authService = {
  login,
  logout,
  me,
  getAuthErrorMessage,
};
