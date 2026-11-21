import type { InfluencersQueryParams } from "@/types/influencer";

export const influencerKeys = {
  all: ["influencers"] as const,
  lists: () => [...influencerKeys.all, "list"] as const,
  list: (params: InfluencersQueryParams) =>
    [...influencerKeys.lists(), params] as const,
  details: () => [...influencerKeys.all, "detail"] as const,
  detail: (id: string) => [...influencerKeys.details(), id] as const,
  ibp: (id: string) => [...influencerKeys.detail(id), "ibp"] as const,
  managers: () => [...influencerKeys.all, "managers"] as const,
};

export function invalidateInfluencerQueries(
  queryClient: {
    invalidateQueries: (filters: {
      queryKey: readonly unknown[];
    }) => Promise<unknown>;
  },
  influencerId?: string,
) {
  const tasks = [
    queryClient.invalidateQueries({ queryKey: influencerKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: influencerKeys.managers() }),
  ];

  if (influencerId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: influencerKeys.detail(influencerId),
      }),
      queryClient.invalidateQueries({
        queryKey: influencerKeys.ibp(influencerId),
      }),
    );
  } else {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: influencerKeys.details() }),
    );
  }

  return Promise.all(tasks);
}
