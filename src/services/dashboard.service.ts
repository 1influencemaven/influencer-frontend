import { listInfluencers } from "@/services/influencers.service";

export type DashboardMetrics = {
  totalInfluencers: number | null;
  activeInfluencers: number | null;
  brandsFound: number | null;
  activeCampaigns: number | null;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const [totalResponse, activeResponse] = await Promise.all([
      listInfluencers({ page: 1, limit: 1 }),
      listInfluencers({ page: 1, limit: 1, profileStatus: "COMPLETED" }),
    ]);

    return {
      totalInfluencers: totalResponse.meta.total,
      activeInfluencers: activeResponse.meta.total,
      brandsFound: null,
      activeCampaigns: null,
    };
  } catch {
    return {
      totalInfluencers: null,
      activeInfluencers: null,
      brandsFound: null,
      activeCampaigns: null,
    };
  }
}

export const dashboardService = {
  getDashboardMetrics,
};
