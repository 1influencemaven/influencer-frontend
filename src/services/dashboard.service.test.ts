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
import { getDashboardStats } from "@/services/dashboard.service";
import { createAxiosResponse } from "@/services/service-test-utils";
import type { DashboardStats } from "@/types/dashboard";

const mockedApiClient = jest.mocked(apiClient);

const sampleStats: DashboardStats = {
  metrics: {
    talentsActiveIbp: 4,
    talentsNeedingIbp: 2,
    brandsUnderReview: 7,
    approvedWithoutContacts: 1,
    readyContacts: 12,
    emailAccountsConnected: 3,
    emailAccountsDisconnected: 1,
  },
  attention: [
    {
      id: "brands-under-review",
      type: "BRANDS_UNDER_REVIEW",
      title: "Brands awaiting review",
      count: 7,
      href: "/dashboard/brand-discovery",
    },
  ],
};

describe("dashboard.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches dashboard stats from /dashboard/stats", async () => {
    mockedApiClient.get.mockResolvedValue(createAxiosResponse(sampleStats));

    await expect(getDashboardStats()).resolves.toEqual(sampleStats);
    expect(mockedApiClient.get).toHaveBeenCalledWith("/dashboard/stats");
  });
});
