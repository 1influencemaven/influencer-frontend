"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { BbcRunStatusBanner } from "@/components/lead-discovery/bbc-run-status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBbcDiscovery } from "@/hooks/use-bbc-discovery";
import type { BrandBusinessContact } from "@/types/lead-discovery";

type BrandBusinessContactsPanelProps = {
  brandCandidateId: string;
};

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function evidenceLink(contact: BrandBusinessContact): string | null {
  if (isHttpUrl(contact.sourceUrl)) {
    return contact.sourceUrl;
  }
  const fromEvidence = contact.evidences.find((item) =>
    isHttpUrl(item.sourceUrl),
  );
  return fromEvidence?.sourceUrl ?? null;
}

function evidenceSnippet(contact: BrandBusinessContact): string | null {
  const snippet = contact.evidences.find(
    (item) => item.evidenceSnippet.trim().length > 0,
  )?.evidenceSnippet;
  return snippet?.trim() || null;
}

function ContactList({
  contacts,
  emptyLabel,
  t,
}: {
  contacts: BrandBusinessContact[];
  emptyLabel: string;
  t: (key: string) => string;
}) {
  if (contacts.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {contacts.map((contact) => {
        const link = evidenceLink(contact);
        const snippet = evidenceSnippet(contact);
        return (
          <li
            key={contact.id}
            className="rounded-md border border-border bg-background p-3 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${contact.email}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {contact.email}
              </a>
              {contact.label ? (
                <Badge variant="outline">{contact.label}</Badge>
              ) : null}
              <Badge variant="secondary">
                {contact.isGeneric ? t("type.generic") : t("type.personLike")}
              </Badge>
              <Badge variant="secondary">
                {t(`relevance.${contact.commercialRelevance}`)}
              </Badge>
            </div>
            {snippet ? (
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {t("evidence")}:{" "}
                </span>
                {snippet}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {t("source")}: {contact.source}
              {!snippet ? ` · ${t("evidenceUnverified")}` : null}
            </p>
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline"
              >
                {t("openEvidence")}
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function BrandBusinessContactsPanel({
  brandCandidateId,
}: BrandBusinessContactsPanelProps) {
  const t = useTranslations("LeadDiscovery.businessContacts");
  const tBbc = useTranslations("LeadDiscovery.bbc");
  const {
    bbcV1Active,
    canSearch,
    contacts,
    runs,
    loading,
    loadingMeta,
    searching,
    hasProcessing,
    error,
    pollError,
    uiState,
    startSearch,
    refresh,
  } = useBbcDiscovery(brandCandidateId);

  const genericContacts = useMemo(
    () => contacts.filter((c) => c.isGeneric),
    [contacts],
  );
  const otherContacts = useMemo(
    () => contacts.filter((c) => !c.isGeneric),
    [contacts],
  );

  const emptyMessageKey =
    uiState.kind === "provider_failure"
      ? "emptyAfterProviderFailure"
      : uiState.kind === "no_matches"
        ? "emptyAfterNoMatches"
        : uiState.kind === "failed"
          ? "emptyAfterFailed"
          : "empty";

  const showEmpty =
    !loading &&
    !error &&
    contacts.length === 0 &&
    uiState.kind !== "processing" &&
    uiState.kind !== "partial_while_processing";

  return (
    <section
      className="mt-4 space-y-3 rounded-md border border-border bg-muted/30 p-3"
      aria-labelledby={`bbc-title-${brandCandidateId}`}
    >
      <div className="space-y-1">
        <h4
          id={`bbc-title-${brandCandidateId}`}
          className="text-sm font-medium"
        >
          {t("title")}
        </h4>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>

      {bbcV1Active ? (
        <p
          className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground"
          role="status"
        >
          {tBbc("activeBanner")}
        </p>
      ) : null}

      {error ? (
        <div className="space-y-2" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" size="sm" variant="outline" onClick={refresh}>
            {t("retry")}
          </Button>
        </div>
      ) : null}

      <BbcRunStatusBanner
        state={uiState}
        pollError={pollError}
        runs={runs}
      />

      {bbcV1Active ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={
              searching ||
              hasProcessing ||
              loadingMeta ||
              !canSearch ||
              loading
            }
            onClick={() => void startSearch()}
          >
            {searching || hasProcessing
              ? tBbc("searching")
              : tBbc("searchAction")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading || searching}
            onClick={refresh}
          >
            {tBbc("refresh")}
          </Button>
        </div>
      ) : null}

      {loading ? (
        <p className="text-xs text-muted-foreground">{t("loading")}</p>
      ) : null}

      {showEmpty ? (
        <p
          className={`text-xs ${
            uiState.kind === "provider_failure" || uiState.kind === "failed"
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
          role={
            uiState.kind === "provider_failure" || uiState.kind === "failed"
              ? "alert"
              : undefined
          }
        >
          {t(emptyMessageKey)}
        </p>
      ) : null}

      {!loading && contacts.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("sections.genericTitle")}
            </h5>
            <p className="text-xs text-muted-foreground">
              {t("sections.genericDescription")}
            </p>
            <ContactList
              contacts={genericContacts}
              emptyLabel={t("sections.genericEmpty")}
              t={t}
            />
          </div>
          <div className="space-y-2">
            <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("sections.otherTitle")}
            </h5>
            <p className="text-xs text-muted-foreground">
              {t("sections.otherDescription")}
            </p>
            <ContactList
              contacts={otherContacts}
              emptyLabel={t("sections.otherEmpty")}
              t={t}
            />
          </div>
        </div>
      ) : null}

      {!loading ? (
        <div className="space-y-1 border-t border-border pt-3">
          <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("sections.agenciesTitle")}
          </h5>
          <p className="text-xs text-muted-foreground">
            {t("sections.agenciesPending")}
          </p>
        </div>
      ) : null}
    </section>
  );
}
