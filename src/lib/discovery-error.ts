/**
 * Maps raw discovery run error messages (backend/worker internals such as
 * "PLAN_SEARCH wait failed: Timed out after 120000ms …") to a user-facing
 * reason key. The raw text stays available as a technical detail.
 */
export type DiscoveryErrorKind =
  | "aiTimeout"
  | "aiFailed"
  | "searchProvider"
  | "noResults"
  | "inProgress"
  | "generic";

export function classifyDiscoveryError(message: string | null | undefined): DiscoveryErrorKind {
  const text = (message ?? "").toLowerCase();
  if (!text) return "generic";
  if (/already in progress/.test(text)) return "inProgress";
  if (/no_serp_hits|no search results|0 hits/.test(text)) return "noResults";
  if (/timed out|timeout|wait failed/.test(text)) return "aiTimeout";
  if (/serp|bright ?data|unlocker|search provider|brd_/.test(text)) return "searchProvider";
  if (/ai_|llm|mastra|anthropic|ollama|structured output|invalid_output|credit balance|schema/.test(text)) {
    return "aiFailed";
  }
  return "generic";
}
