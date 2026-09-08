import { getLeadById } from "@/services/lead-discovery.service";
import { mapWithConcurrency } from "@/lib/map-with-concurrency";
import type { LeadDetail } from "@/types/lead-discovery";

/** Max parallel GET /leads/:id while enriching the list (D3.1). */
export const LEAD_DETAIL_FETCH_CONCURRENCY = 8;

/**
 * Fetches enriched lead details for list display.
 * Temporary D3.1 pattern until GET /leads returns channels + readiness.
 */
export async function fetchLeadDetailsForList(
  leadIds: string[],
): Promise<LeadDetail[]> {
  if (leadIds.length === 0) {
    return [];
  }

  const results = await mapWithConcurrency(
    leadIds,
    LEAD_DETAIL_FETCH_CONCURRENCY,
    async (id) => {
      try {
        return await getLeadById(id);
      } catch {
        return null;
      }
    },
  );

  return results.filter((lead): lead is LeadDetail => lead !== null);
}
