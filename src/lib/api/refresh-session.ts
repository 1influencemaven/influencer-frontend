import axios from "axios";

import { shouldAttemptRefresh } from "@/lib/api/auth-refresh-policy";
import { getApiBaseUrl } from "@/config/env";
import type { RefreshResponse } from "@/types/auth";

const AUTH_REFRESH_PATH = "/auth/refresh";
const REQUEST_TIMEOUT_MS = 30_000;

export { shouldAttemptRefresh };

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

export function refreshSession(): Promise<RefreshResponse> {
  refreshPromise ??= refreshClient
    .post<RefreshResponse>(AUTH_REFRESH_PATH)
    .then(({ data }) => data)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
