/**
 * @jest-environment node
 */

import {
  getApiBaseUrl,
  getServerApiBaseUrl,
  isDevelopment,
} from "@/config/env";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

function setNodeEnv(value: "development" | "production" | "test"): void {
  process.env = { ...process.env, NODE_ENV: value };
}

describe("env", () => {
  describe("getApiBaseUrl", () => {
    it("returns the configured public api url", () => {
      process.env.NEXT_PUBLIC_API_URL = "/api/v1";
      expect(getApiBaseUrl()).toBe("/api/v1");
    });

    it("falls back in development when the env var is missing", () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      setNodeEnv("development");

      expect(getApiBaseUrl()).toBe("/api/v1");
    });

    it("throws outside development when the env var is missing", () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      setNodeEnv("production");

      expect(() => getApiBaseUrl()).toThrow(
        "NEXT_PUBLIC_API_URL is not defined",
      );
    });
  });

  describe("getServerApiBaseUrl", () => {
    it("returns absolute urls unchanged", () => {
      process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api/v1";
      expect(getServerApiBaseUrl()).toBe("http://localhost:3000/api/v1");
    });

    it("joins relative urls with the app origin", () => {
      process.env.NEXT_PUBLIC_API_URL = "/api/v1";
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";

      expect(getServerApiBaseUrl()).toBe("http://localhost:3001/api/v1");
    });

    it("uses development defaults when app origin is missing", () => {
      process.env.NEXT_PUBLIC_API_URL = "/api/v1";
      delete process.env.NEXT_PUBLIC_APP_URL;
      setNodeEnv("development");

      expect(getServerApiBaseUrl()).toBe("http://localhost:3001/api/v1");
    });

    it("strips trailing slashes from the origin", () => {
      process.env.NEXT_PUBLIC_API_URL = "/api/v1";
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001/";

      expect(getServerApiBaseUrl()).toBe("http://localhost:3001/api/v1");
    });

    it("uses PORT in production when app origin is missing", () => {
      process.env.NEXT_PUBLIC_API_URL = "/api/v1";
      delete process.env.NEXT_PUBLIC_APP_URL;
      setNodeEnv("production");
      process.env.PORT = "4000";

      expect(getServerApiBaseUrl()).toBe("http://localhost:4000/api/v1");
    });
  });

  describe("isDevelopment", () => {
    it("reflects NODE_ENV", () => {
      setNodeEnv("development");
      expect(isDevelopment()).toBe(true);

      setNodeEnv("production");
      expect(isDevelopment()).toBe(false);
    });
  });
});
