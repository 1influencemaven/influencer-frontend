"use client";

import { useQuery } from "@tanstack/react-query";

import { influencerKeys } from "@/lib/influencer-query-keys";
import { listInfluencerManagers } from "@/services/influencers.service";

export function useInfluencerManagers() {
  return useQuery({
    queryKey: influencerKeys.managers(),
    queryFn: listInfluencerManagers,
  });
}
