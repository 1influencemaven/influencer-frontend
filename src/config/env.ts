const DEV_API_BASE_URL = "/api/v1";
const DEV_APP_ORIGIN = "http://localhost:3001";

export function getApiBaseUrl(): string {
  // Must use a static property access so Next.js inlines NEXT_PUBLIC_* for the client bundle.
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  if (baseURL) {
    return baseURL;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "NEXT_PUBLIC_API_URL is not defined. Falling back to /api/v1.",
    );
    return DEV_API_BASE_URL;
  }

  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export function getServerApiBaseUrl(): string {
  const baseURL = getApiBaseUrl();

  if (baseURL.startsWith("http://") || baseURL.startsWith("https://")) {
    return baseURL;
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NODE_ENV === "development"
      ? DEV_APP_ORIGIN
      : `http://localhost:${process.env.PORT ?? "3000"}`);

  return `${origin.replace(/\/$/, "")}${baseURL}`;
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}
