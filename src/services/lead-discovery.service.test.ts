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
  listAgencyContacts,
  listBrandBusinessContacts,
  probeUnlockerDiagnostic,
  searchLeads,
  selectLeadForOutreach,
} from "@/services/lead-discovery.service";
import { createAxiosResponse } from "@/services/service-test-utils";
import type {
  AgencyContactCommercial,
  BrandBusinessContact,
  Lead,
  LeadDetail,
  SearchLeadsResponse,
} from "@/types/lead-discovery";
import { UNLOCKER_DIAGNOSTIC_ALLOWED_URL } from "@/types/lead-discovery";

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

  it("lists agency contacts by influencerId", async () => {
    const contacts: AgencyContactCommercial[] = [
      {
        agencyId: "a1",
        agencyName: "Creator Partners",
        agencyDomain: "creatorpartners.example",
        agencyRelevanceStatus: "RELEVANT",
        agencyContactId: "ac1",
        contactKind: "MAILBOX",
        email: "partnerships@creatorpartners.example",
        displayName: null,
        title: null,
        label: null,
        isGeneric: true,
        commercialRelevance: "HIGH",
        sourceKind: "agency_web",
        provenance: {
          discoveryStatus: "FOUND",
          attributionStatus: "ATTRIBUTED",
          verificationStatus: "UNVERIFIED",
        },
        attributionStatus: "ATTRIBUTED",
        evidence: [],
        outreachRole: null,
        discoveredAt: "2026-01-01T00:00:00.000Z",
        eligibilityStatus: "ACTIONABLE",
        eligibilityReason: "relevant_high",
        priority: true,
        origin: "AGENCY_CONTACT_RESEARCH",
        track: "2C",
        researchOperation: "FIND_AGENCY_EMAILS",
      },
    ];
    mockedApiClient.get.mockResolvedValue(createAxiosResponse(contacts));

    const result = await listAgencyContacts({ influencerId: "inf-1" });

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      "/lead-discovery/agency-contacts?influencerId=inf-1",
    );
    expect(result).toEqual(contacts);
  });

  it("lists brand business contacts by brandCandidateId", async () => {
    const contacts: BrandBusinessContact[] = [
      {
        id: "bbc1",
        brandCandidateId: "b1",
        email: "partnerships@acme.com",
        label: "Partnerships",
        isGeneric: true,
        commercialRelevance: "HIGH",
        source: "PUBLIC_WEB",
        sourceUrl: "https://acme.com/partners",
        evidences: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    mockedApiClient.get.mockResolvedValue(createAxiosResponse(contacts));

    const result = await listBrandBusinessContacts("b1");

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      "/lead-discovery/business-contacts?brandCandidateId=b1",
    );
    expect(result).toEqual(contacts);
  });

  it("posts unlocker diagnostic probe for the allowlisted URL", async () => {
    const diagnostic = {
      url: UNLOCKER_DIAGNOSTIC_ALLOWED_URL,
      outcome: "ok",
      apiHttpStatus: 200,
      bodyLength: 12,
      elapsedMs: 50,
      zone: "mcp_unlocker",
    };
    mockedApiClient.post.mockResolvedValue(createAxiosResponse(diagnostic));

    const result = await probeUnlockerDiagnostic();

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      "/lead-discovery/diagnostics/unlocker",
      { url: UNLOCKER_DIAGNOSTIC_ALLOWED_URL },
    );
    expect(result).toEqual(diagnostic);
  });
});
