"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

/** Small icon button that copies an email and confirms with a check. */
export function CopyEmailButton({ email, className }: { email: string; className?: string }) {
  const t = useTranslations("LeadDiscovery.email");
  const { status, copy } = useCopyToClipboard();
  const label = status === "success" ? t("copied") : status === "error" ? t("copyFailed") : t("copy");
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void copy(email);
      }}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        status === "success" && "text-notion-green",
        className,
      )}
      aria-label={`${label}: ${email}`}
      title={label}
    >
      {status === "success" ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
    </button>
  );
}
