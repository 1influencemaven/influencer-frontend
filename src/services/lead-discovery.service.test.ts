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
import { searchLeads } from "@/services/lead-discovery.service";
import { createAxiosResponse } from "@/services/service-test-utils";
import type { SearchLeadsResponse } from "@/types/lead-discovery";

const mockedApiClient = jest.mocked(apiClient);

describe("lead-discovery.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("posts search payload", async () => {
    const response: SearchLeadsResponse = {
      message: "ok",
      runs: [],
    };
    mockedApiClient.post.mockResolvedValue(createAxiosResponse(response));

    await searchLeads({
      brandCandidateIds: ["b1"],
      providerId: "brightdata",
      options: { optionIds: ["gd_1"] },
      limit: 5,
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith("/lead-discovery/search", {
      brandCandidateIds: ["b1"],
      providerId: "brightdata",
      options: { optionIds: ["gd_1"] },
      limit: 5,
    });
  });
});
