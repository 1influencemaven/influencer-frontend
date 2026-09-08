jest.mock("../services/lead-discovery.service", () => ({
  getLeadById: jest.fn(),
}));

import { getLeadById } from "../services/lead-discovery.service";
import {
  fetchLeadDetailsForList,
  LEAD_DETAIL_FETCH_CONCURRENCY,
} from "./lead-discovery-enrichment";
import type { LeadDetail } from "../types/lead-discovery";

const mockedGetLeadById = jest.mocked(getLeadById);

describe("fetchLeadDetailsForList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches details with bounded concurrency constant", () => {
    expect(LEAD_DETAIL_FETCH_CONCURRENCY).toBeGreaterThanOrEqual(5);
    expect(LEAD_DETAIL_FETCH_CONCURRENCY).toBeLessThanOrEqual(10);
  });

  it("returns enriched leads and skips failures", async () => {
    const detail: LeadDetail = {
      id: "l1",
      status: "APPROVED",
      selectedForOutreach: false,
      person: { name: "Ada", position: null, company: "Acme" },
      contactChannels: [],
      outreachReadiness: "LIMITED",
      email: null,
      profileUrl: null,
    };
    mockedGetLeadById
      .mockResolvedValueOnce(detail)
      .mockRejectedValueOnce(new Error("fail"));

    const results = await fetchLeadDetailsForList(["l1", "l2"]);

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("l1");
  });
});
