"use client";

import { Braces, Mail, Send, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { EmailAccountsView } from "@/components/email-accounts/email-accounts-view";
import { FieldsView } from "@/components/fields/fields-view";
import { ProspectsView } from "@/components/prospects/prospects-view";
import { cn } from "@/lib/utils";

type CampaignTab = "emailAccounts" | "fields" | "sequences" | "prospects";

const TABS: Array<{ id: CampaignTab; icon: typeof Mail; available: boolean }> = [
  { id: "emailAccounts", icon: Mail, available: true },
  { id: "fields", icon: Braces, available: true },
  { id: "prospects", icon: UserRound, available: true },
  { id: "sequences", icon: Send, available: false },
];

/**
 * Campaigns hub (Saleshandy-like layout with the app's Notion palette):
 * page title + underlined tab strip; each tab hosts an outreach module.
 */
export function CampaignsView() {
  const t = useTranslations("Campaigns");
  const [tab, setTab] = useState<CampaignTab>("emailAccounts");

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
          {TABS.map(({ id, icon: Icon, available }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              disabled={!available}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-0.5 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                tab === id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
                !available && "cursor-not-allowed opacity-60 hover:text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t(`tabs.${id}`)}
              {!available ? (
                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  {t("soon")}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      {tab === "emailAccounts" ? <EmailAccountsView /> : null}
      {tab === "fields" ? <FieldsView /> : null}
      {tab === "prospects" ? <ProspectsView /> : null}
    </div>
  );
}
