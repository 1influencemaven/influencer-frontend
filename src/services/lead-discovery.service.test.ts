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
  deselectLeadForOutreach,
  getLeadById,
  searchLeads,
  selectLeadForOutreach,
} from "@/services/lead-discovery.service";
import { createAxiosResponse } from "@/services/service-test-utils";
import type { Lead, LeadDetail, SearchLeadsResponse } from "@/types/lead-discovery";

const mockedApiClient = jest.mocked(apiClient);

const sampleLead: Lead = {
  id: "l1",
  brandCandidateId: "b1",
  influencerId: "i1",
  runId: "r1",
  contactName: "Ada",
  title: "CMO",
  email: "ada@acme.com",
  emailConfidence: "UNKNOWN",
  isGeneric: false,
  profileUrl: null,
  providerId: "brightdata",
  sourceOptionId: null,
  fitReason: null,
  source: "test",
  status: "APPROVED",
  selectedForOutreach: true,
  metadata: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

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

  it("posts select for outreach", async () => {
    mockedApiClient.post.mockResolvedValue(createAxiosResponse(sampleLead));

    const result = await selectLeadForOutreach("l1");

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      "/lead-discovery/leads/l1/select",
    );
    expect(result.selectedForOutreach).toBe(true);
  });

  it("deletes select to deselect for outreach", async () => {
    mockedApiClient.delete.mockResolvedValue(
      createAxiosResponse({ ...sampleLead, selectedForOutreach: false }),
    );

    const result = await deselectLeadForOutreach("l1");

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      "/lead-discovery/leads/l1/select",
    );
    expect(result.selectedForOutreach).toBe(false);
  });

  it("gets lead by id", async () => {
    const detail: LeadDetail = {
      id: "l1",
      status: "APPROVED",
      selectedForOutreach: false,
      person: { name: "Ada", position: "CMO", company: "Acme" },
      contactChannels: [],
      outreachReadiness: "LIMITED",
      email: null,
      profileUrl: null,
    };
    mockedApiClient.get.mockResolvedValue(createAxiosResponse(detail));

    const result = await getLeadById("l1");

    expect(mockedApiClient.get).toHaveBeenCalledWith("/lead-discovery/leads/l1");
    expect(result.outreachReadiness).toBe("LIMITED");
  });
});
