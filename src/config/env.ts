const DEV_API_BASE_URL = "http://localhost:3000/api/v1";

export function getApiBaseUrl(): string {
  // Must use a static property access so Next.js inlines NEXT_PUBLIC_* for the client bundle.
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  if (baseURL) {
    return baseURL;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "NEXT_PUBLIC_API_URL is not defined. Falling back to http://localhost:3000/api/v1.",
    );
    return DEV_API_BASE_URL;
  }

  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}
