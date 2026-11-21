import {
  isBbcSearchMetadata,
  isBbcWriteProviderId,
  type BrandBusinessContact,
  type BbcProviderFailureKind,
  type BbcRunOutcome,
  type LeadDiscoveryRun,
  type LeadSearchMetadata,
} from "@/types/lead-discovery";

/**
 * Honest UI states for Contact Discovery BBC v1 (ADR-0020 / T5).
 * Never map PROVIDER_FAILURE → empty search, or PROCESSING → error.
 */
export type BbcUiStateKind =
  | "idle"
  | "processing"
  | "results_found"
  | "no_matches"
  | "provider_failure"
  | "failed"
  | "load_error"
  | "partial_while_processing";

export type BbcUiState = {
  kind: BbcUiStateKind;
  runId?: string;
  outcome?: BbcRunOutcome;
  providerFailureKind?: BbcProviderFailureKind;
  errorMessage?: string | null;
  pagesFailed?: number;
  contactsCreated?: number;
  contactsUpdated?: number;
  /** Contacts listed for the brand (may be orphaned — BBC has no runId). */
  contactCount: number;
};

function isBbcRun(run: LeadDiscoveryRun): boolean {
  if (isBbcWriteProviderId(run.providerId)) {
    return true;
  }
  return isBbcSearchMetadata(run.searchMetadata);
}

function sortByCreatedDesc(runs: LeadDiscoveryRun[]): LeadDiscoveryRun[] {
  return [...runs].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function latestBbcRun(runs: LeadDiscoveryRun[]): LeadDiscoveryRun | null {
  const bbc = sortByCreatedDesc(runs.filter(isBbcRun));
  return bbc[0] ?? null;
}

/**
 * Resolve BBC panel UI state from GET runs + GET business-contacts + optional load error.
 * Does not invent run↔contact links (Prisma BBC has no runId).
 */
export function resolveBbcUiState(args: {
  runs: LeadDiscoveryRun[];
  contacts: BrandBusinessContact[];
  loadError?: string | null;
}): BbcUiState {
  const contactCount = args.contacts.length;

  if (args.loadError) {
    return {
      kind: "load_error",
      errorMessage: args.loadError,
      contactCount,
    };
  }

  const run = latestBbcRun(args.runs);
  if (!run) {
    return { kind: "idle", contactCount };
  }

  if (run.status === "PROCESSING") {
    if (contactCount > 0) {
      return {
        kind: "partial_while_processing",
        runId: run.id,
        contactCount,
      };
    }
    return { kind: "processing", runId: run.id, contactCount };
  }

  if (run.status === "FAILED") {
    return {
      kind: "failed",
      runId: run.id,
      errorMessage: run.errorMessage,
      contactCount,
    };
  }

  const meta = run.searchMetadata as LeadSearchMetadata | null | undefined;
  if (isBbcSearchMetadata(meta)) {
    const pagesFailed = meta.businessContacts.pagesFailed ?? 0;
    const created = meta.businessContacts.created ?? 0;
    const updated = meta.businessContacts.updated ?? 0;

    if (meta.outcome === "RESULTS_FOUND") {
      return {
        kind: "results_found",
        runId: run.id,
        outcome: "RESULTS_FOUND",
        pagesFailed,
        contactsCreated: created,
        contactsUpdated: updated,
        contactCount,
      };
    }
    if (meta.outcome === "NO_MATCHES") {
      return {
        kind: "no_matches",
        runId: run.id,
        outcome: "NO_MATCHES",
        contactCount,
      };
    }
    if (meta.outcome === "PROVIDER_FAILURE") {
      return {
        kind: "provider_failure",
        runId: run.id,
        outcome: "PROVIDER_FAILURE",
        providerFailureKind: meta.providerFailureKind,
        errorMessage: meta.errorSummary?.message ?? run.errorMessage,
        contactCount,
      };
    }
  }

  return {
    kind: "failed",
    runId: run.id,
    errorMessage: run.errorMessage ?? "BBC_METADATA_UNAVAILABLE",
    contactCount,
  };
}
