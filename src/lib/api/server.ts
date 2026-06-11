import axios, { type AxiosInstance } from "axios";
import { cookies, headers } from "next/headers";

import { getApiBaseUrl } from "@/config/env";
import type { ApiRequestConfig } from "@/lib/api/types";
import { toApiError } from "@/types/api-error";
import type { ApiResponse } from "@/types/api-response";

const REQUEST_TIMEOUT_MS = 30_000;

type ServerRequestOptions = Omit<ApiRequestConfig, "baseURL">;

async function buildForwardHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const requestHeaders = await headers();

  const forwarded: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (cookieHeader) {
    forwarded.Cookie = cookieHeader;
  }

  const acceptLanguage = requestHeaders.get("accept-language");
  if (acceptLanguage) {
    forwarded["Accept-Language"] = acceptLanguage;
  }

  return forwarded;
}

export async function createServerApiClient(): Promise<AxiosInstance> {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: REQUEST_TIMEOUT_MS,
    headers: await buildForwardHeaders(),
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toApiError(error)),
  );

  return instance;
}

export async function serverApiGet<T>(
  path: string,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> {
  const client = await createServerApiClient();
  const { data } = await client.get<ApiResponse<T>>(path, options);
  return data;
}

export async function serverApiPost<T, B = unknown>(
  path: string,
  body?: B,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> {
  const client = await createServerApiClient();
  const { data } = await client.post<ApiResponse<T>>(path, body, options);
  return data;
}

export async function serverApiPut<T, B = unknown>(
  path: string,
  body?: B,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> {
  const client = await createServerApiClient();
  const { data } = await client.put<ApiResponse<T>>(path, body, options);
  return data;
}

export async function serverApiPatch<T, B = unknown>(
  path: string,
  body?: B,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> {
  const client = await createServerApiClient();
  const { data } = await client.patch<ApiResponse<T>>(path, body, options);
  return data;
}

export async function serverApiDelete<T>(
  path: string,
  options?: ServerRequestOptions,
): Promise<ApiResponse<T>> {
  const client = await createServerApiClient();
  const { data } = await client.delete<ApiResponse<T>>(path, options);
  return data;
}
