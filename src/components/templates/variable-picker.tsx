"use client";

import { Braces, Building2, Search, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { filterVariables } from "@/lib/template-editor";
import { cn } from "@/lib/utils";
import type { VariableDefinition, VariablesCatalog, VariableSource } from "@/types/templates";

const SOURCE_ICONS: Record<VariableSource, typeof Braces> = {
  influencer: UserRound,
  prospect: Building2,
  custom: Braces,
};
const ORDER: VariableSource[] = ["prospect", "influencer", "custom"];

/** Searchable "{{ }} Variables" menu grouped by source (HU-TPL-008 CA-02). */
export function VariablePicker({
  catalog,
  onSelect,
  size = "sm",
  label,
}: {
  catalog: VariablesCatalog | undefined;
  onSelect: (variable: VariableDefinition) => void;
  size?: "sm" | "icon";
  label?: string;
}) {
  const t = useTranslations("Templates.variables");
  const [query, setQuery] = useState("");

  return (
    <DropdownMenu onOpenChange={(open) => !open && setQuery("")}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className={cn("h-8 gap-1 px-2 text-xs", size === "icon" && "w-8 px-0")} aria-label={t("open")}>
          <Braces className="size-3.5" aria-hidden />
          {size === "sm" ? (label ?? t("button")) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-96 w-80 overflow-y-auto p-0"
        // The caller moves focus to where the variable was inserted (editor or input).
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-popover p-2">
          <label className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2 size-3.5 text-muted-foreground" aria-hidden />
            <span className="sr-only">{t("search")}</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder={t("search")}
              className="h-8 w-full rounded-md border border-input bg-card pr-2 pl-7 text-sm outline-none focus-visible:border-ring"
            />
          </label>
        </div>
        {!catalog ? <p className="p-3 text-xs text-muted-foreground">{t("loading")}</p> : null}
        {catalog
          ? ORDER.map((source, index) => {
              const items = filterVariables(catalog.groups[source] ?? [], query).filter((v) => v.isActive);
              if (!items.length) return null;
              const Icon = SOURCE_ICONS[source];
              return (
                <div key={source} className="p-1">
                  {index > 0 ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuLabel className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="size-3.5" aria-hidden />
                    {t(`groups.${source}`)}
                  </DropdownMenuLabel>
                  {items.map((v) => (
                    <DropdownMenuItem key={v.key} onSelect={() => onSelect(v)} className="flex flex-col items-start gap-0.5 py-1.5">
                      <span className="text-sm">{v.label}</span>
                      <span className="flex w-full items-center gap-2 text-[11px] text-muted-foreground">
                        <code className="font-mono">{v.token}</code>
                        {source !== "influencer" ? (
                          <span className="ml-auto truncate">
                            {v.fallbackText ? t("fallback", { value: v.fallbackText }) : t("noFallback")}
                          </span>
                        ) : null}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              );
            })
          : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
