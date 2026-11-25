"use client";

import { CheckCircle2, Download, Loader2, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { EmailAccountJob } from "@/types/email-accounts";

/** Saleshandy report links are https URLs on their CDN/S3; never render other schemes. */
function safeReportUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function EmailAccountJobs({ jobs }: { jobs: EmailAccountJob[] }) {
  const t = useTranslations("EmailAccounts.jobs");
  const locale = useLocale();
  if (jobs.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("title")}</h2>
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {jobs.slice(0, 6).map((job) => {
          const report = safeReportUrl(job.reportUrl);
          return (
            <li key={job.id} className="flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-2.5">
                {job.status === "PROCESSING" ? (
                  <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" aria-hidden />
                ) : job.status === "COMPLETED" ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-notion-green" aria-hidden />
                ) : (
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                )}
                <div className="min-w-0">
                  <p className="font-medium">
                    {t(`type.${job.type}`, { count: job.accountCount })}
                    <span className="ml-2 font-normal text-muted-foreground">{t(`status.${job.status}`)}</span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                      new Date(job.createdAt),
                    )}
                    {job.initiatedBy?.name ? ` · ${job.initiatedBy.name}` : ""}
                    {job.type === "CONNECT" && job.targets.length > 0 ? ` · ${job.targets.slice(0, 3).join(", ")}` : ""}
                    {job.errorMessage ? ` · ${job.errorMessage}` : ""}
                  </p>
                </div>
              </div>
              {report ? (
                <a
                  href={report}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 sm:self-auto"
                >
                  <Download className="size-3.5" aria-hidden />
                  {t("report")}
                </a>
              ) : job.status === "COMPLETED" ? (
                <span className="text-xs text-muted-foreground">{t("noReport")}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
