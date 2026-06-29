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
  createInfluencer,
  deleteInfluencer,
  generateProfile,
  getInfluencer,
  listInfluencers,
  updateInfluencer,
} from "@/services/influencers.service";
import { createAxiosResponse } from "@/services/service-test-utils";

const mockedApiClient = jest.mocked(apiClient);

const influencer = {
  id: "inf-1",
  name: "Laura Martinez",
  instagram: "@laura",
  tiktok: null,
  youtube: null,
  country: "ES",
  language: "es",
  niche: "Fitness",
  subNiche: null,
  followers: 180000,
  engagement: "4.50",
  email: "laura@example.com",
  mediaKitUrl: null,
  profileStatus: "PENDING" as const,
  commercialProfile: null,
  createdAt: "2026-06-28T12:00:00.000Z",
  updatedAt: "2026-06-28T12:00:00.000Z",
};

describe("influencers.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listInfluencers", () => {
    it("fetches paginated influencers with query params", async () => {
      const response = {
        data: [influencer],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockedApiClient.get.mockResolvedValue(createAxiosResponse(response));

      await expect(
        listInfluencers({
          page: 1,
          limit: 20,
          search: "laura",
          profileStatus: "PENDING",
          sortBy: "name",
          sortOrder: "asc",
        }),
      ).resolves.toEqual(response);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        "/influencers?page=1&limit=20&search=laura&profileStatus=PENDING&sortBy=name&sortOrder=asc",
      );
    });
  });

  describe("getInfluencer", () => {
    it("fetches a single influencer by id", async () => {
      mockedApiClient.get.mockResolvedValue(createAxiosResponse(influencer));

      await expect(getInfluencer("inf-1")).resolves.toEqual(influencer);
      expect(mockedApiClient.get).toHaveBeenCalledWith("/influencers/inf-1");
    });
  });

  describe("createInfluencer", () => {
    it("creates an influencer", async () => {
      mockedApiClient.post.mockResolvedValue(createAxiosResponse(influencer));

      await expect(
        createInfluencer({ name: "Laura Martinez" }),
      ).resolves.toEqual(influencer);

      expect(mockedApiClient.post).toHaveBeenCalledWith("/influencers", {
        name: "Laura Martinez",
      });
    });
  });

  describe("updateInfluencer", () => {
    it("updates an influencer", async () => {
      mockedApiClient.patch.mockResolvedValue(createAxiosResponse(influencer));

      await expect(
        updateInfluencer("inf-1", { niche: "Wellness" }),
      ).resolves.toEqual(influencer);

      expect(mockedApiClient.patch).toHaveBeenCalledWith("/influencers/inf-1", {
        niche: "Wellness",
      });
    });
  });

  describe("deleteInfluencer", () => {
    it("deletes an influencer", async () => {
      const response = { message: "Influencer deleted successfully" };
      mockedApiClient.delete.mockResolvedValue(createAxiosResponse(response));

      await expect(deleteInfluencer("inf-1")).resolves.toEqual(response);
      expect(mockedApiClient.delete).toHaveBeenCalledWith("/influencers/inf-1");
    });
  });

  describe("generateProfile", () => {
    it("queues commercial profile generation", async () => {
      const response = {
        message: "Profile generation job enqueued",
        influencerId: "inf-1",
        profileStatus: "PROCESSING" as const,
      };

      mockedApiClient.post.mockResolvedValue(createAxiosResponse(response));

      await expect(generateProfile("inf-1")).resolves.toEqual(response);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        "/influencers/inf-1/generate-profile",
      );
    });
  });
});
