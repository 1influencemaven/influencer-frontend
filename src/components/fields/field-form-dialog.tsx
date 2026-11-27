"use client";

import { AlertTriangle, Loader2, Lock, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { FIELD_TYPE_ICONS, FieldVariable } from "@/components/fields/field-badges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api-error";
import {
  CURRENCY_CODES,
  FIELD_TYPES,
  MAX_DROPDOWN_OPTIONS,
  MAX_FIELD_TAGS,
  type CreateFieldPayload,
  type CustomField,
  type FieldType,
  type UpdateFieldPayload,
} from "@/types/fields";

type FieldFormDialogProps = {
  /** null = create mode. */
  field: CustomField | null;
  availableTags: string[];
  onClose: () => void;
  onCreate: (payload: CreateFieldPayload) => Promise<unknown>;
  onUpdate: (id: string, payload: UpdateFieldPayload) => Promise<unknown>;
};

/** Mirrors the backend key generation (the server may append a number on collision). */
export function previewKey(label: string): string {
  const words = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
  const key = words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("")
    .slice(0, 60);
  if (!key) return "";
  return /^[a-z]/.test(key) ? key : `field${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  return values
    .map((v) => v.trim().replace(/\s+/g, " "))
    .filter((v) => {
      const lower = v.toLowerCase();
      if (!v || seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
}

const inputClass =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60";

/** Chip input: Enter / comma adds, Backspace removes the last chip, pasting a list adds many. */
function ChipInput({
  values,
  onChange,
  max,
  placeholder,
  suggestions = [],
  ariaLabel,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  max: number;
  placeholder: string;
  suggestions?: string[];
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState("");
  const listId = useId();
  const add = (raw: string) => {
    const next = dedupe([...values, ...raw.split(/[\n,]/)]).slice(0, max);
    onChange(next);
    setDraft("");
  };
  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1 rounded-md border border-input bg-card px-2 py-1 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-sm bg-muted py-0.5 pr-0.5 pl-1.5 text-xs text-secondary-foreground"
        >
          {value}
          <button
            type="button"
            className="rounded-sm p-0.5 hover:bg-background"
            onClick={() => onChange(values.filter((v) => v !== value))}
            aria-label={`× ${value}`}
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        value={draft}
        list={suggestions.length ? listId : undefined}
        aria-label={ariaLabel}
        disabled={values.length >= max}
        placeholder={values.length ? "" : placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === ",") && draft.trim()) {
            event.preventDefault();
            add(draft);
          } else if (event.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={() => draft.trim() && add(draft)}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text");
          if (/[\n,]/.test(text)) {
            event.preventDefault();
            add(text);
          }
        }}
        className="h-7 min-w-28 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {suggestions.length ? (
        <datalist id={listId}>
          {suggestions
            .filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()))
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
      ) : null}
    </div>
  );
}

/** Centered "Add field" / "Edit field" modal, like Saleshandy's Prospect Fields dialog. */
export function FieldFormDialog({ field, availableTags, onClose, onCreate, onUpdate }: FieldFormDialogProps) {
  const t = useTranslations("Fields");
  const editing = field !== null;
  const [label, setLabel] = useState(field?.label ?? "");
  const [fieldType, setFieldType] = useState<FieldType>(field?.fieldType ?? "text");
  const [options, setOptions] = useState<string[]>(field?.metadata?.options ?? []);
  const [currencyCode, setCurrencyCode] = useState<string>(field?.metadata?.currencyCode ?? "USD");
  const [fallbackText, setFallbackText] = useState(field?.fallbackText ?? "");
  const [tags, setTags] = useState<string[]>(field?.tags ?? []);
  const [tagsDirty, setTagsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const labelId = useId();
  const fallbackId = useId();
  const currencyId = useId();

  const key = previewKey(label);

  function validate(): string | null {
    if (!label.trim()) return t("form.errors.labelRequired");
    if (!editing && fieldType === "dropdown" && options.length === 0) return t("form.errors.optionsRequired");
    return null;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (editing) {
        const payload: UpdateFieldPayload = {};
        if (label.trim() !== field.label) payload.label = label.trim();
        if (fallbackText.trim() !== (field.fallbackText ?? "")) payload.fallbackText = fallbackText.trim();
        if (tagsDirty) payload.tags = tags;
        if (Object.keys(payload).length === 0) {
          onClose();
          return;
        }
        await onUpdate(field.id, payload);
      } else {
        await onCreate({
          label: label.trim(),
          fieldType,
          ...(fallbackText.trim() ? { fallbackText: fallbackText.trim() } : {}),
          ...(fieldType === "dropdown" ? { metadata: { options } } : {}),
          ...(fieldType === "currency"
            ? { metadata: { currencyCode: currencyCode as (typeof CURRENCY_CODES)[number] } }
            : {}),
          ...(tags.length ? { tags } : {}),
        });
      }
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, t("form.errors.generic")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${labelId}-title`}
      onKeyDown={(event) => event.key === "Escape" && !submitting && onClose()}
    >
      <form
        onSubmit={(event) => void submit(event)}
        className="flex max-h-full w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id={`${labelId}-title`} className="text-lg font-semibold">
              {editing ? t("form.editTitle") : t("form.createTitle")}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {editing ? t("form.editDescription") : t("form.createDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t("form.cancel")}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-1.5">
            <label htmlFor={labelId} className="text-sm font-medium">
              {t("form.label")} <span className="text-destructive">*</span>
            </label>
            <input
              id={labelId}
              autoFocus
              maxLength={100}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={t("form.labelPlaceholder")}
              className={inputClass}
            />
            {!editing && key ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {t("form.variablePreview")} <FieldVariable fieldKey={key} />
              </p>
            ) : null}
            {editing ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {t("form.variableFixed")} <FieldVariable fieldKey={field.key} />
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              {t("form.type")} {!editing ? <span className="text-destructive">*</span> : <Lock className="size-3 text-muted-foreground" aria-hidden />}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t("form.type")}>
              {FIELD_TYPES.map((type) => {
                const Icon = FIELD_TYPE_ICONS[type];
                const active = fieldType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={editing}
                    onClick={() => setFieldType(type)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      editing && !active && "hidden",
                      editing && "cursor-not-allowed",
                    )}
                  >
                    <Icon className={cn("size-4", active ? "text-primary" : "")} aria-hidden />
                    {t(`types.${type}`)}
                  </button>
                );
              })}
            </div>
            {editing ? <p className="text-xs text-muted-foreground">{t("form.typeLocked")}</p> : null}
          </div>

          {fieldType === "dropdown" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t("form.options")} {!editing ? <span className="text-destructive">*</span> : null}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {options.length} / {MAX_DROPDOWN_OPTIONS}
                </span>
              </div>
              {editing ? (
                options.length ? (
                  <div className="flex flex-wrap gap-1">
                    {options.map((option) => (
                      <span key={option} className="rounded-sm bg-muted px-1.5 py-0.5 text-xs">
                        {option}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t("peek.notAvailable")}</p>
                )
              ) : (
                <>
                  <ChipInput
                    values={options}
                    onChange={setOptions}
                    max={MAX_DROPDOWN_OPTIONS}
                    placeholder={t("form.optionsPlaceholder")}
                    ariaLabel={t("form.options")}
                  />
                  <p className="text-xs text-muted-foreground">{t("form.optionsHint")}</p>
                </>
              )}
            </div>
          ) : null}

          {fieldType === "currency" ? (
            <div className="space-y-1.5">
              <label htmlFor={currencyId} className="text-sm font-medium">
                {t("form.currency")} {!editing ? <span className="text-destructive">*</span> : null}
              </label>
              <select
                id={currencyId}
                value={currencyCode}
                disabled={editing}
                onChange={(event) => setCurrencyCode(event.target.value)}
                className={inputClass}
              >
                {CURRENCY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor={fallbackId} className="text-sm font-medium">
              {t("form.fallback")} <span className="font-normal text-muted-foreground">({t("form.optional")})</span>
            </label>
            <input
              id={fallbackId}
              maxLength={255}
              value={fallbackText}
              onChange={(event) => setFallbackText(event.target.value)}
              placeholder={t("form.fallbackPlaceholder")}
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground">{t("form.fallbackHint")}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("form.tags")} <span className="font-normal text-muted-foreground">({t("form.optional")})</span>
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {tags.length} / {MAX_FIELD_TAGS}
              </span>
            </div>
            <ChipInput
              values={tags}
              onChange={(next) => {
                setTags(next);
                setTagsDirty(true);
              }}
              max={MAX_FIELD_TAGS}
              placeholder={t("form.tagsPlaceholder")}
              suggestions={availableTags}
              ariaLabel={t("form.tags")}
            />
            <p className="text-xs text-muted-foreground">{t("form.tagsHint")}</p>
            {editing && tagsDirty ? (
              <p className="flex items-start gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {t("form.tagsReplaceWarning")}
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {t("form.cancel")}
          </Button>
          <Button type="submit" disabled={submitting} className="gap-1.5">
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {editing ? t("form.save") : t("form.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
