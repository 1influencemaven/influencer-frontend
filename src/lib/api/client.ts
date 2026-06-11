import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { getApiBaseUrl, isDevelopment } from "@/config/env";
import type { ApiRequestConfig } from "@/lib/api/types";
import { toApiError } from "@/types/api-error";

const REQUEST_TIMEOUT_MS = 30_000;

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function logRequest(config: InternalAxiosRequestConfig): void {
  if (!isDevelopment()) {
    return;
  }

  const method = config.method?.toUpperCase() ?? "GET";
  const url = `${config.baseURL ?? ""}${config.url ?? ""}`;

  console.info(`[api] → ${method} ${url}`);
}

function logResponse(response: AxiosResponse): void {
  if (!isDevelopment()) {
    return;
  }

  const method = response.config.method?.toUpperCase() ?? "GET";
  const url = `${response.config.baseURL ?? ""}${response.config.url ?? ""}`;

  console.info(`[api] ← ${response.status} ${method} ${url}`);
}

function logError(error: AxiosError): void {
  if (!isDevelopment()) {
    return;
  }

  const method = error.config?.method?.toUpperCase() ?? "GET";
  const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
  const status = error.response?.status ?? "NETWORK";

  console.error(`[api] ✕ ${status} ${method} ${url}`);
}

apiClient.interceptors.request.use((config) => {
  const requestConfig = config as InternalAxiosRequestConfig & ApiRequestConfig;

  requestConfig.withCredentials = true;

  if (typeof document !== "undefined") {
    requestConfig.headers.set("Accept-Language", document.documentElement.lang);
  }

  const isAuthGet =
    requestConfig.method?.toLowerCase() === "get" &&
    requestConfig.url?.startsWith("/auth");

  if (isAuthGet) {
    requestConfig.headers.set("Cache-Control", "no-store");
    requestConfig.headers.set("Pragma", "no-cache");
  }

  logRequest(requestConfig);

  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => {
    logResponse(response);
    return response;
  },
  async (error: AxiosError) => {
    logError(error);

    // Future refresh-token flow (error.config supports ApiRequestConfig._retry):
    // const originalRequest = error.config as InternalAxiosRequestConfig & ApiRequestConfig;
    // if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //   await refreshSession();
    //   return apiClient(originalRequest);
    // }

    return Promise.reject(toApiError(error));
  },
);

export { apiClient };
export default apiClient;
