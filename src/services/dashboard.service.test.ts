/**
 * @jest-environment node
 */

jest.mock("./influencers.service", () => ({
  listInfluencers: jest.fn(),
}));

import { listInfluencers } from "@/services/influencers.service";
import { getDashboardMetrics } from "@/services/dashboard.service";

const mockedListInfluencers = jest.mocked(listInfluencers);

describe("dashboard.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("aggregates influencer totals and leaves placeholders null", async () => {
    mockedListInfluencers
      .mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 1, total: 12, totalPages: 12 },
      })
      .mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 1, total: 5, totalPages: 5 },
      });

    await expect(getDashboardMetrics()).resolves.toEqual({
      totalInfluencers: 12,
      activeInfluencers: 5,
      brandsFound: null,
      activeCampaigns: null,
    });

    expect(mockedListInfluencers).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 1,
    });
    expect(mockedListInfluencers).toHaveBeenNthCalledWith(2, {
      page: 1,
      limit: 1,
      profileStatus: "COMPLETED",
    });
  });

  it("returns null metrics when requests fail", async () => {
    mockedListInfluencers.mockRejectedValue(new Error("network"));

    await expect(getDashboardMetrics()).resolves.toEqual({
      totalInfluencers: null,
      activeInfluencers: null,
      brandsFound: null,
      activeCampaigns: null,
    });
  });
});
