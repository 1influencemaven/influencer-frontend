import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

export function createAxiosResponse<T>(
  data: T,
  config: Partial<InternalAxiosRequestConfig> = {},
): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {
      headers: {},
      ...config,
    } as InternalAxiosRequestConfig,
  };
}

export function createApiError(
  status: number,
  message: string,
  code?: string,
) {
  return {
    status,
    message,
    code,
  };
}
