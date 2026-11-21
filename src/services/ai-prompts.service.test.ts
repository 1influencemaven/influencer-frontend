/**
 * @jest-environment node
 */

jest.mock("../lib/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import apiClient from "@/lib/api/client";
import {
  getIbpPrompt,
  resetIbpPrompt,
  updateIbpPrompt,
} from "@/services/ai-prompts.service";
import { createAxiosResponse } from "@/services/service-test-utils";

const mockedApiClient = jest.mocked(apiClient);

const template = {
  id: "default",
  instructions: "You are a commercial strategist...",
  updatedById: null,
  createdAt: "2026-07-16T12:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
  isDefault: true,
};

describe("ai-prompts.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches the IBP prompt template", async () => {
    mockedApiClient.get.mockResolvedValue(createAxiosResponse(template));

    await expect(getIbpPrompt()).resolves.toEqual(template);
    expect(mockedApiClient.get).toHaveBeenCalledWith("/settings/ibp-prompt");
  });

  it("updates the IBP prompt template", async () => {
    const updated = { ...template, instructions: "New", isDefault: false };
    mockedApiClient.patch.mockResolvedValue(createAxiosResponse(updated));

    await expect(
      updateIbpPrompt({ instructions: "New" }),
    ).resolves.toEqual(updated);
    expect(mockedApiClient.patch).toHaveBeenCalledWith("/settings/ibp-prompt", {
      instructions: "New",
    });
  });

  it("resets the IBP prompt template", async () => {
    mockedApiClient.post.mockResolvedValue(createAxiosResponse(template));

    await expect(resetIbpPrompt()).resolves.toEqual(template);
    expect(mockedApiClient.post).toHaveBeenCalledWith(
      "/settings/ibp-prompt/reset",
    );
  });
});
