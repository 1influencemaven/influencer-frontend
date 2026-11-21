/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { useBbcDiscovery } from "@/hooks/use-bbc-discovery";
import {
  listBrandBusinessContacts,
  listLeadDiscoveryRuns,
  listLeadProviders,
  listLeads,
  searchLeads,
} from "@/services/lead-discovery.service";

jest.mock("../services/lead-discovery.service", () => ({
  listLeadProviders: jest.fn(),
  listBrandBusinessContacts: jest.fn(),
  listLeadDiscoveryRuns: jest.fn(),
  listLeads: jest.fn(),
  searchLeads: jest.fn(),
}));

const mockedProviders = jest.mocked(listLeadProviders);
const mockedContacts = jest.mocked(listBrandBusinessContacts);
const mockedRuns = jest.mocked(listLeadDiscoveryRuns);
const mockedLeads = jest.mocked(listLeads);
const mockedSearch = jest.mocked(searchLeads);

describe("useBbcDiscovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedProviders.mockResolvedValue({
      available: ["bbc-brightdata"],
      default: "bbc-brightdata",
      rebuildMode: true,
    });
    mockedContacts.mockResolvedValue([]);
    mockedLeads.mockResolvedValue([]);
    mockedRuns.mockResolvedValue([]);
    const processingRun = {
      id: "run-bbc",
      brandCandidateId: "b1",
      influencerId: "i1",
      status: "PROCESSING" as const,
      providerId: "bbc-brightdata",
      providerOptions: {},
      limit: 10,
      errorMessage: null,
      createdAt: "2026-10-29T00:00:00.000Z",
      updatedAt: "2026-10-29T00:00:00.000Z",
      searchMetadata: null,
    };
    mockedSearch.mockImplementation(async () => {
      mockedRuns.mockResolvedValue([processingRun]);
      return {
        message: "Contact discovery BBC jobs enqueued",
        runs: [processingRun],
      };
    });
  });

  it("enables BBC search when rebuildMode and mastra-contact-emails are available", async () => {
    mockedProviders.mockResolvedValue({
      available: ["mastra-contact-emails"],
      default: "mastra-contact-emails",
      rebuildMode: true,
    });
    mockedContacts.mockResolvedValue([]);
    mockedRuns.mockResolvedValue([]);

    const { result } = renderHook(() => useBbcDiscovery("b1"));
    await waitFor(() => expect(result.current.loadingMeta).toBe(false));
    expect(result.current.bbcV1Active).toBe(true);
    expect(result.current.canSearch).toBe(true);
  });

  it("enables BBC search when rebuildMode and bbc-brightdata are available", async () => {
    const { result } = renderHook(() => useBbcDiscovery("b1"));

    await waitFor(() => expect(result.current.loadingMeta).toBe(false));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bbcV1Active).toBe(true);
    expect(result.current.canSearch).toBe(true);
  });

  it("does not enable search when rebuildMode is false (legacy)", async () => {
    mockedProviders.mockResolvedValue({
      available: ["ai+brightdata"],
      default: "ai+brightdata",
      rebuildMode: false,
    });

    const { result } = renderHook(() => useBbcDiscovery("b1"));
    await waitFor(() => expect(result.current.loadingMeta).toBe(false));

    expect(result.current.bbcV1Active).toBe(false);
    expect(result.current.canSearch).toBe(false);
  });

  it("enqueues BBC search with bbc-brightdata and seeds PROCESSING run", async () => {
    const { result } = renderHook(() => useBbcDiscovery("b1"));
    await waitFor(() => expect(result.current.canSearch).toBe(true));

    await act(async () => {
      await result.current.startSearch();
    });

    expect(mockedSearch).toHaveBeenCalledWith({
      brandCandidateIds: ["b1"],
      providerId: "bbc-brightdata",
    });
    expect(result.current.hasProcessing).toBe(true);
    expect(result.current.runs.some((r) => r.id === "run-bbc")).toBe(true);
  });

  it("blocks duplicate start while PROCESSING", async () => {
    mockedRuns.mockResolvedValue([
      {
        id: "run-busy",
        brandCandidateId: "b1",
        influencerId: "i1",
        status: "PROCESSING",
        providerId: "bbc-brightdata",
        providerOptions: {},
        limit: 10,
        errorMessage: null,
        createdAt: "2026-10-29T00:00:00.000Z",
        updatedAt: "2026-10-29T00:00:00.000Z",
        searchMetadata: null,
      },
    ]);

    const { result } = renderHook(() => useBbcDiscovery("b1"));
    await waitFor(() => expect(result.current.hasProcessing).toBe(true));

    await act(async () => {
      await result.current.startSearch();
    });

    expect(mockedSearch).not.toHaveBeenCalled();
  });

  it("captures start search HTTP errors", async () => {
    mockedSearch.mockRejectedValue(new Error("Already in progress"));

    const { result } = renderHook(() => useBbcDiscovery("b1"));
    await waitFor(() => expect(result.current.canSearch).toBe(true));

    await act(async () => {
      await result.current.startSearch();
    });

    expect(result.current.error).toBe("Already in progress");
  });
});

