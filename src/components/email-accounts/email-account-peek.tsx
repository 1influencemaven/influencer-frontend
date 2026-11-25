"use client";

import { RefreshCw, Settings2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  EmailAccountStatusPill,
  HealthScoreBar,
  NotionTag,
  providerLabel,
} from "@/components/email-accounts/email-account-badges";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { EmailAccount } from "@/types/email-accounts";

type PeekProps = {
  account: EmailAccount | null;
  onClose: () => void;
  onReconnect: (account: EmailAccount) => void;
  onEdit: (account: EmailAccount) => void;
};

function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] items-start gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

const dash = <span className="text-muted-foreground">—</span>;
const value = (v: number | string | null | undefined, suffix = "") =>
  v === null || v === undefined || v === "" ? dash : `${v}${suffix}`;

/** Notion-style side peek with every property and sending setting of an account. */
export function EmailAccountPeek({ account, onClose, onReconnect, onEdit }: PeekProps) {
  const t = useTranslations("EmailAccounts");
  const locale = useLocale();

  return (
    <Sheet open={account !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {account ? (
          <>
            <SheetHeader className="border-b border-border px-6 pt-8 pb-5">
              <SheetTitle className="text-2xl font-semibold tracking-tight">
                {account.fromName || account.fromEmail}
              </SheetTitle>
              <SheetDescription>{account.fromEmail}</SheetDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                {account.status !== "CONNECTED" ? (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onReconnect(account)}>
                    <RefreshCw className="size-3.5" aria-hidden />
                    {t("actions.reconnect")}
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onEdit(account)}>
                  <Settings2 className="size-3.5" aria-hidden />
                  {t("actions.editSettings")}
                </Button>
              </div>
            </SheetHeader>

            <div className="space-y-6 px-6 py-5">
              <section>
                <Property label={t("peek.status")}>
                  <EmailAccountStatusPill status={account.status} />
                </Property>
                <Property label={t("peek.health")}>
                  <HealthScoreBar score={account.healthScore} />
                </Property>
                <Property label={t("peek.provider")}>{providerLabel(account.provider)}</Property>
                <Property label={t("peek.type")}>{t(`type.${account.type}`)}</Property>
                <Property label={t("peek.default")}>
                  {account.isDefault ? t("peek.yes") : t("peek.no")}
                </Property>
                <Property label={t("peek.client")}>{account.client?.name ?? dash}</Property>
                <Property label={t("peek.addedBy")}>{account.addedBy ?? dash}</Property>
                <Property label={t("peek.createdAt")}>
                  {account.createdAt
                    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                        new Date(account.createdAt),
                      )
                    : dash}
                </Property>
                <Property label={t("peek.sequences")}>
                  {account.sequences.length === 0 ? (
                    dash
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {account.sequences.map((sequence) => (
                        <NotionTag key={sequence.id} className={sequence.active ? "" : "opacity-60"}>
                          {sequence.title}
                        </NotionTag>
                      ))}
                    </div>
                  )}
                </Property>
              </section>

              <section>
                <h3 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("peek.sendingSettings")}
                </h3>
                <Property label={t("fields.dailyQuota")}>{value(account.settings.dailySendingLimit)}</Property>
                <Property label={t("peek.availableQuota")}>{value(account.settings.availableQuota)}</Property>
                <Property label={t("peek.maxSendingLimit")}>{value(account.settings.maxSendingLimit)}</Property>
                <Property label={t("fields.interval")}>
                  {account.settings.minIntervalSeconds !== null
                    ? t("peek.intervalValue", {
                        min: account.settings.minIntervalSeconds,
                        max: account.settings.maxIntervalSeconds ?? "—",
                      })
                    : dash}
                </Property>
                <Property label={t("peek.rampUp")}>
                  {account.settings.rampUpEnabled
                    ? t("peek.rampUpValue", {
                        initial: account.settings.rampUpInitialSendingLimit ?? 0,
                        percent: account.settings.rampUpPercent ?? 0,
                        limit: account.settings.rampUpLimit ?? 0,
                      })
                    : t("peek.rampUpOff")}
                </Property>
                <Property label={t("fields.bcc")}>{value(account.settings.bcc)}</Property>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("fields.signature")}
                </h3>
                {account.settings.signatureHtml ? (
                  <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
                    {account.settings.signatureHtml}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("peek.noSignature")}</p>
                )}
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
