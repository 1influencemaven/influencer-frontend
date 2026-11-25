import { classifyDiscoveryError } from "@/lib/discovery-error";

describe("classifyDiscoveryError", () => {
  it.each([
    ["PLAN_SEARCH wait failed: Timed out after 120000ms waiting for ai.execution.results job x", "aiTimeout"],
    ["SCORE_CANDIDATES wait failed: Timed out after 300000ms", "aiTimeout"],
    ["Mastra RESEARCH_BRAND failed: Empty schema", "aiFailed"],
    ["AI_PROVIDER_ERROR: LLM down", "aiFailed"],
    ["Bright Data SERP request failed (502)", "searchProvider"],
    ["skipped: NO_SERP_HITS", "noResults"],
    ["Brand discovery already in progress for influencer Laura", "inProgress"],
    ["something unexpected", "generic"],
    [null, "generic"],
  ])("%s -> %s", (message, kind) => {
    expect(classifyDiscoveryError(message)).toBe(kind);
  });
});
