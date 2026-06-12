import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}",
  ],
  modulePathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/out/"],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/config/**/*.{ts,tsx}",
    "src/schemas/**/*.{ts,tsx}",
    "src/services/**/*.{ts,tsx}",
    "src/stores/**/*.{ts,tsx}",
    "!src/schemas/schema-test-utils.ts",
    "!src/schemas/**/*.test.ts",
    "!src/services/service-test-utils.ts",
    "src/types/api-error.ts",
    "!src/lib/api/client.ts",
    "!src/lib/api/server.ts",
    "!src/lib/api/refresh-session.ts",
    "!src/lib/api/types.ts",
    "!src/lib/auth/proxy-auth.ts",
    "!src/**/*.d.ts",
    "!src/app/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "html", "lcov"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};

export default createJestConfig(config);
