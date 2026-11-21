"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type {
  BrandCommercialSignal,
  BrandDeepResearch,
  BrandResearchFieldStatus,
  BrandResearchedField,
} from "@/types/brand-discovery";

function statusVariant(
  status: BrandResearchFieldStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "VERIFIED":
      return "default";
    case "PARTIAL":
      return "secondary";
    case "NOT_FOUND":
      return "outline";
    case "UNAVAILABLE":
      return "destructive";
    default:
      return "outline";
  }
}

function formatValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const t = value.trim();
    return t || null;
  }
  if (Array.isArray(value)) {
    const parts = value
      .filter((v): v is string => typeof v === "string" && Boolean(v.trim()))
      .map((v) => v.trim());
    return parts.length ? parts.join(", ") : null;
  }
  return String(value);
}

function FieldRow({
  label,
  field,
  statusLabel,
}: {
  label: string;
  field: BrandResearchedField<unknown>;
  statusLabel: (s: BrandResearchFieldStatus) => string;
}) {
  const display = formatValue(field.value);
  if (!display && (field.status === "NOT_FOUND" || field.status === "UNAVAILABLE")) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <Badge variant={statusVariant(field.status)}>
          {statusLabel(field.status)}
        </Badge>
      </div>
    );
  }
  if (!display) {
    return null;
  }
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium">{label}</span>
        <Badge variant={statusVariant(field.status)}>
          {statusLabel(field.status)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{display}</p>
    </div>
  );
}

function SignalRow({
  signal,
  kindLabel,
  statusLabel,
  presentLabel,
  absentLabel,
}: {
  signal: BrandCommercialSignal;
  kindLabel: string;
  statusLabel: string;
  presentLabel: string;
  absentLabel: string;
}) {
  let valueLabel: string | null = null;
  if (signal.value === true) valueLabel = presentLabel;
  if (signal.value === false) valueLabel = absentLabel;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="font-medium">{kindLabel}</span>
      <Badge variant={statusVariant(signal.status)}>{statusLabel}</Badge>
      {valueLabel ? <Badge variant="outline">{valueLabel}</Badge> : null}
      {signal.note ? (
        <span className="text-muted-foreground">{signal.note}</span>
      ) : null}
    </div>
  );
}

export function BrandDeepResearchPanel({
  research,
}: {
  research: BrandDeepResearch;
}) {
  const t = useTranslations("BrandDiscovery");
  const statusLabel = (s: BrandResearchFieldStatus) =>
    t(`deepResearch.fieldStatus.${s}`);

  return (
    <div className="mt-4 space-y-3 rounded-md border border-border/60 bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{t("deepResearch.title")}</span>
        <Badge
          variant={
            research.researchStatus === "FAILED"
              ? "destructive"
              : research.researchStatus === "PARTIAL"
                ? "secondary"
                : "default"
          }
        >
          {t(`deepResearch.researchStatus.${research.researchStatus}`)}
        </Badge>
      </div>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("deepResearch.company")}
        </h4>
        <FieldRow
          label={t("deepResearch.description")}
          field={research.company.description}
          statusLabel={statusLabel}
        />
        <FieldRow
          label={t("deepResearch.brandSize")}
          field={research.company.brandSize}
          statusLabel={statusLabel}
        />
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("deepResearch.industry")}
        </h4>
        <FieldRow
          label={t("deepResearch.sectors")}
          field={research.industry.sectors}
          statusLabel={statusLabel}
        />
        <FieldRow
          label={t("deepResearch.categories")}
          field={research.industry.categories}
          statusLabel={statusLabel}
        />
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("deepResearch.offerings")}
        </h4>
        <FieldRow
          label={t("deepResearch.products")}
          field={research.offerings.productsAndServices}
          statusLabel={statusLabel}
        />
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("deepResearch.markets")}
        </h4>
        <FieldRow
          label={t("deepResearch.regions")}
          field={research.markets.countriesOrRegions}
          statusLabel={statusLabel}
        />
      </section>

      {research.commercialSignals.length > 0 ? (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("deepResearch.signals")}
          </h4>
          {research.commercialSignals.map((signal) => (
            <SignalRow
              key={`${signal.kind}-${signal.status}`}
              signal={signal}
              kindLabel={t(`deepResearch.signalKind.${signal.kind}`)}
              statusLabel={t(`deepResearch.fieldStatus.${signal.status}`)}
              presentLabel={t("deepResearch.signalPresent")}
              absentLabel={t("deepResearch.signalAbsent")}
            />
          ))}
        </section>
      ) : null}

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("deepResearch.affinity")}
        </h4>
        {typeof research.influencerFit.score === "number" ? (
          <p className="text-sm">
            {t("score", { value: Math.round(research.influencerFit.score) })}
          </p>
        ) : null}
        <FieldRow
          label={t("deepResearch.rationale")}
          field={research.influencerFit.rationale}
          statusLabel={statusLabel}
        />
        {research.influencerFit.alignmentNotes ? (
          <FieldRow
            label={t("deepResearch.alignmentNotes")}
            field={research.influencerFit.alignmentNotes}
            statusLabel={statusLabel}
          />
        ) : null}
      </section>

      {research.pages.length > 0 ? (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("deepResearch.pages")}
          </h4>
          <ul className="space-y-1">
            {research.pages.map((page) => (
              <li
                key={`${page.url}-${page.role}`}
                className="flex flex-wrap items-center gap-2 text-xs"
              >
                <Badge variant="outline">{page.role}</Badge>
                <Badge variant="secondary">{page.fetchStatus}</Badge>
                {page.fetchStatus === "ok" ? (
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {page.url}
                  </a>
                ) : (
                  <span className="text-muted-foreground">
                    {page.url}
                    {page.errorMessage ? ` — ${page.errorMessage}` : ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {research.warnings && research.warnings.length > 0 ? (
        <section className="space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("deepResearch.warnings")}
          </h4>
          {research.warnings.map((w) => (
            <p key={w} className="text-xs text-muted-foreground">
              {w}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  );
}
