const API_URL_ENV_KEY = "NEXT_PUBLIC_API_URL" as const;

export function getApiBaseUrl(): string {
  const baseURL = process.env[API_URL_ENV_KEY];

  if (!baseURL) {
    throw new Error(`${API_URL_ENV_KEY} is not defined`);
  }

  return baseURL;
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}
