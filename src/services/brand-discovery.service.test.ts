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
  deleteBrandCandidate,
  searchBrands,
} from "@/services/brand-discovery.service";
import { createAxiosResponse } from "@/services/service-test-utils";
import type { SearchBrandsResponse } from "@/types/brand-discovery";

const mockedApiClient = jest.mocked(apiClient);

describe("brand-discovery.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("posts search with influencer ids", async () => {
    const response: SearchBrandsResponse = {
      message: "ok",
      runs: [],
    };
    mockedApiClient.post.mockResolvedValue(createAxiosResponse(response));

    const result = await searchBrands(["id-1"]);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/brand-discovery/search", {
      influencerIds: ["id-1"],
      limit: 20,
    });
    expect(result).toEqual(response);
  });

  it("posts search with custom limit", async () => {
    const response: SearchBrandsResponse = {
      message: "ok",
      runs: [],
    };
    mockedApiClient.post.mockResolvedValue(createAxiosResponse(response));

    await searchBrands(["id-1"], 5);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/brand-discovery/search", {
      influencerIds: ["id-1"],
      limit: 5,
    });
  });

  it("deletes a brand candidate", async () => {
    mockedApiClient.delete.mockResolvedValue(createAxiosResponse(undefined));

    await deleteBrandCandidate("bc-1");

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      "/brand-discovery/candidates/bc-1",
    );
  });
});
