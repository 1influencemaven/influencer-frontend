"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { EmailAccountStatus } from "@/types/email-accounts";

const STATUS_STYLES: Record<EmailAccountStatus, { dot: string; pill: string }> = {
  CONNECTED: {
    dot: "bg-notion-green",
    pill: "bg-notion-green/10 text-notion-green",
  },
  DISCONNECTED: {
    dot: "bg-destructive",
    pill: "bg-destructive/10 text-destructive",
  },
  PAUSED: {
    dot: "bg-notion-ink-faint",
    pill: "bg-muted text-muted-foreground",
  },
};

/** Notion-style select pill: soft background + colored dot. */
export function EmailAccountStatusPill({ status }: { status: EmailAccountStatus }) {
  const t = useTranslations("EmailAccounts.status");
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
      {t(status)}
    </span>
  );
}

/** Health score 0–100 as a thin progress bar + number. */
export function HealthScoreBar({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const value = Math.max(0, Math.min(100, score));
  const tone =
    value >= 80 ? "bg-notion-green" : value >= 50 ? "bg-notion-sky" : "bg-destructive";
  return (
    <div className="flex min-w-24 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-7 text-right text-xs tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

/** Small gray tag (Notion multi-select look). */
export function NotionTag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-40 items-center truncate rounded-sm bg-muted px-1.5 py-0.5 text-xs text-secondary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function providerLabel(provider: string | null | undefined): string {
  if (!provider) return "—";
  const labels: Record<string, string> = {
    gsuite: "Google Workspace",
    microsoft: "Microsoft",
    o365: "Office 365",
    yahoo: "Yahoo",
    zoho: "Zoho",
    godaddy: "GoDaddy",
    yandex: "Yandex",
    sendgrid: "SendGrid",
    other: "Other",
  };
  return labels[provider] ?? provider;
}

/** Saleshandy-style health score: colored ring with the number inside. */
export function HealthScoreCircle({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>;
  const value = Math.max(0, Math.min(100, score));
  const color =
    value >= 80 ? "var(--notion-green)" : value >= 50 ? "var(--notion-sky)" : "var(--destructive)";
  return (
    <span
      className="inline-grid size-9 place-items-center rounded-full text-[11px] font-semibold tabular-nums"
      style={{
        background: `conic-gradient(${color} ${value * 3.6}deg, var(--muted) 0deg)`,
      }}
      title={`${value}/100`}
    >
      <span className="grid size-7 place-items-center rounded-full bg-card">{value}</span>
    </span>
  );
}

/** Initials avatar used in the accounts list. */
export function SenderAvatar({ name, email }: { name: string; email: string }) {
  const source = name.trim() || email;
  const initials =
    source
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {initials}
    </span>
  );
}
