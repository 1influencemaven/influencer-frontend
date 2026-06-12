import axios from "axios";

import { getApiBaseUrl } from "@/config/env";
import type { RefreshResponse } from "@/types/auth";

const AUTH_REFRESH_PATH = "/auth/refresh";
const REQUEST_TIMEOUT_MS = 30_000;

const AUTH_PATHS_WITHOUT_REFRESH = [
  "/auth/refresh",
  "/auth/login",
  "/auth/logout",
  "/auth/register",
] as const;

const refreshClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let refreshPromise: Promise<RefreshResponse> | null = null;

export function shouldAttemptRefresh(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  return !AUTH_PATHS_WITHOUT_REFRESH.some((path) => url.includes(path));
}

export function refreshSession(): Promise<RefreshResponse> {
  refreshPromise ??= refreshClient
    .post<RefreshResponse>(AUTH_REFRESH_PATH)
    .then(({ data }) => data)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
