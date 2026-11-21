"use client";

import { useTranslations } from "next-intl";

import type {
  InterpretationClassificationItem,
  InterpretationCommercialSignal,
  TalentInterpretation,
} from "@/types/ideal-brand-profile";

type TalentInterpretationPanelProps = {
  interpretation: TalentInterpretation | undefined;
};

type EvidenceItem = {
  fieldPath: string;
  value: string | number | boolean | null;
};

function formatEvidenceDisplay(item: EvidenceItem): {
  kind: "hashtag" | "url" | "field";
  label: string;
  value: string;
} {
  const valueText = item.value === null ? "null" : String(item.value);
  const hashtagPath =
    /^normalized\.(postHashtags|bioHashtags)\[\d+\]$/u.exec(item.fieldPath);
  if (hashtagPath && typeof item.value === "string") {
    const tag = item.value.replace(/^#+/u, "");
    return { kind: "hashtag", label: "hashtag", value: `#${tag}` };
  }
  if (
    /^normalized\.externalUrls\[\d+\]$/u.test(item.fieldPath) &&
    typeof item.value === "string"
  ) {
    return { kind: "url", label: "url", value: item.value };
  }
  return { kind: "field", label: item.fieldPath, value: valueText };
}

function EvidenceList({ evidence }: { evidence: EvidenceItem[] }) {
  const t = useTranslations("IdealBrandProfile.interpretation");
  if (!evidence.length) {
    return null;
  }
  return (
    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
      {evidence.map((item, index) => {
        const display = formatEvidenceDisplay(item);
        return (
          <li key={`${item.fieldPath}:${String(item.value)}:${index}`}>
            {display.kind === "hashtag" ? (
              <>
                <span className="font-medium text-foreground/80">
                  {t("evidenceHashtag")}:
                </span>{" "}
                <span className="text-foreground">{display.value}</span>
              </>
            ) : display.kind === "url" ? (
              <>
                <span className="font-medium text-foreground/80">
                  {t("evidenceUrl")}:
                </span>{" "}
                <a
                  href={display.value}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all underline-offset-2 hover:underline"
                >
                  {display.value}
                </a>
              </>
            ) : (
              <>
                <span className="font-medium text-foreground/80">
                  {t("evidence")}:
                </span>{" "}
                <span>{display.value}</span>
                <span className="ml-1 text-[10px] opacity-70">
                  ({display.label})
                </span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ClassificationBlock({
  title,
  items,
}: {
  title: string;
  items: InterpretationClassificationItem[];
}) {
  const t = useTranslations("IdealBrandProfile.interpretation");
  if (!items.length) {
    return null;
  }
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={`${item.label}:${item.rationale}`}
            className="rounded-md border border-border/70 p-3"
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground">
                {t("confidence")}: {item.confidence}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.rationale}</p>
            <EvidenceList evidence={item.evidence} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommercialSignalsBlock({
  items,
}: {
  items: InterpretationCommercialSignal[];
}) {
  const t = useTranslations("IdealBrandProfile.interpretation");
  if (!items.length) {
    return null;
  }
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{t("commercialSignals")}</h4>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={`${item.type}:${item.label}`}
            className="rounded-md border border-border/70 p-3"
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
                {item.type === "brand_reference"
                  ? t("typeBrandReference")
                  : item.type}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("confidence")}: {item.confidence}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.rationale}</p>
            {item.type === "brand_reference" ? (
              <p
                className="mt-2 rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground"
                role="note"
              >
                {t("brandReferenceDisclaimer")}
              </p>
            ) : item.disclaimer ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {item.disclaimer}
              </p>
            ) : null}
            <EvidenceList evidence={item.evidence} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TalentInterpretationPanel({
  interpretation,
}: TalentInterpretationPanelProps) {
  const t = useTranslations("IdealBrandProfile.interpretation");

  if (!interpretation) {
    return (
      <section className="space-y-2 rounded-lg border border-dashed border-border p-4">
        <h3 className="text-sm font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <h3 className="text-sm font-semibold">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>

      {interpretation.insufficientEvidence ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("insufficient")}
        </p>
      ) : null}

      {interpretation.summary ? (
        <div className="space-y-1">
          <h4 className="text-sm font-medium">{t("profileSummary")}</h4>
          <p className="text-sm">{interpretation.summary.text}</p>
          <p className="text-xs text-muted-foreground">
            {t("confidence")}: {interpretation.summary.confidence}
          </p>
          <EvidenceList evidence={interpretation.summary.evidence} />
        </div>
      ) : null}

      <ClassificationBlock title={t("niches")} items={interpretation.niches} />
      <ClassificationBlock
        title={t("contentCategories")}
        items={interpretation.contentCategories}
      />
      <CommercialSignalsBlock items={interpretation.commercialSignals} />

      {interpretation.limitations.length > 0 ? (
        <div className="space-y-1">
          <h4 className="text-sm font-medium">{t("limitations")}</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {interpretation.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
