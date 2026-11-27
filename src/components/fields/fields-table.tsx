"use client";

import { Check, Copy, Eye, Lock, MoreHorizontal, Pencil, Power, PowerOff } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  FieldOriginBadge,
  FieldStatusBadge,
  FieldTags,
  FieldTypeBadge,
  FieldVariable,
} from "@/components/fields/field-badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { CustomField } from "@/types/fields";

type FieldsTableProps = {
  fields: CustomField[];
  isLoading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  canManage: boolean;
  onOpen: (field: CustomField) => void;
  onEdit: (field: CustomField) => void;
  onToggleStatus: (field: CustomField) => void;
  onRetry: () => void;
  onResetFilters: () => void;
  onSync: () => void;
  onCreate: () => void;
};

const headClass = "h-10 text-xs font-medium text-muted-foreground";

export function FieldsTable({
  fields,
  isLoading,
  error,
  hasActiveFilters,
  canManage,
  onOpen,
  onEdit,
  onToggleStatus,
  onRetry,
  onResetFilters,
  onSync,
  onCreate,
}: FieldsTableProps) {
  const t = useTranslations("Fields");
  const { copy, status: copyStatus } = useCopyToClipboard();

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm" role="alert">
        <p className="font-medium text-destructive">{t("table.errorTitle")}</p>
        <p className="mt-1 text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          {t("table.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className={cn(headClass, "min-w-64 pl-4")}>{t("table.columns.field")}</TableHead>
            <TableHead className={headClass}>{t("table.columns.type")}</TableHead>
            <TableHead className={cn(headClass, "hidden lg:table-cell")}>{t("table.columns.fallback")}</TableHead>
            <TableHead className={cn(headClass, "hidden md:table-cell")}>{t("table.columns.tags")}</TableHead>
            <TableHead className={headClass}>{t("table.columns.origin")}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && fields.length === 0
            ? Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`s-${index}`}>
                  <TableCell className="pl-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-1.5 h-3 w-24" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            : null}

          {!isLoading && fields.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="py-14 text-center">
                <p className="text-sm font-medium">
                  {hasActiveFilters ? t("table.noMatches") : t("table.emptyTitle")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasActiveFilters ? t("table.noMatchesHint") : t("table.emptyHint")}
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {hasActiveFilters ? (
                    <Button variant="outline" size="sm" onClick={onResetFilters}>
                      {t("filters.clear")}
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={onSync}>
                        {t("toolbar.sync")}
                      </Button>
                      {canManage ? (
                        <Button size="sm" onClick={onCreate}>
                          {t("toolbar.add")}
                        </Button>
                      ) : null}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : null}

          {fields.map((field) => (
            <TableRow
              key={field.id}
              className={cn("cursor-pointer", !field.isActive && "opacity-70")}
              onClick={() => onOpen(field)}
            >
              <TableCell className="py-2.5 pl-4">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{field.label}</span>
                  <FieldStatusBadge field={field} />
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <FieldVariable fieldKey={field.key} />
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={t("actions.copyVariable")}
                    onClick={(event) => {
                      event.stopPropagation();
                      void copy(`{{${field.key}}}`);
                    }}
                  >
                    <Copy className="size-3" aria-hidden />
                  </button>
                </div>
              </TableCell>
              <TableCell>
                <FieldTypeBadge field={field} />
              </TableCell>
              <TableCell className="hidden max-w-48 truncate text-sm text-muted-foreground lg:table-cell">
                {field.fallbackText || "—"}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <FieldTags tags={field.tags} />
              </TableCell>
              <TableCell>
                <FieldOriginBadge field={field} />
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8" aria-label={t("actions.menu")}>
                      <MoreHorizontal className="size-4" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={() => onOpen(field)}>
                      <Eye className="size-4" aria-hidden />
                      {t("actions.view")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void copy(`{{${field.key}}}`)}>
                      <Copy className="size-4" aria-hidden />
                      {t("actions.copyVariable")}
                    </DropdownMenuItem>
                    {canManage && field.origin === "CUSTOM" ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={!field.editable || !field.isActive} onClick={() => onEdit(field)}>
                          <Pencil className="size-4" aria-hidden />
                          {t("actions.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={field.disabledReason === "REMOVED_IN_SALESHANDY"}
                          onClick={() => onToggleStatus(field)}
                          className={field.isActive ? "text-destructive focus:text-destructive" : undefined}
                        >
                          {field.isActive ? (
                            <PowerOff className="size-4" aria-hidden />
                          ) : (
                            <Power className="size-4" aria-hidden />
                          )}
                          {field.isActive ? t("actions.disable") : t("actions.enable")}
                        </DropdownMenuItem>
                      </>
                    ) : null}
                    {field.origin === "SYSTEM" ? (
                      <p className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground">
                        <Lock className="size-3" aria-hidden />
                        {t("actions.systemReadonly")}
                      </p>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {copyStatus === "success" ? (
        <div className="flex items-center gap-1.5 border-t border-border px-4 py-2 text-xs text-notion-green" role="status">
          <Check className="size-3.5" aria-hidden />
          {t("actions.copied")}
        </div>
      ) : null}
    </div>
  );
}
