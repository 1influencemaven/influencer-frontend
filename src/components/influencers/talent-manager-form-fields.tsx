"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { CountrySelect } from "@/components/forms/country-select";
import { TagsInput } from "@/components/forms/tags-input";
import { TextFormField } from "@/components/forms/text-form-field";
import { QuartersPicker } from "@/components/influencers/quarters-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { InfluencerManager, QuarterAssignmentInput } from "@/types/influencer";

const selectClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base text-foreground shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

export type TalentManagerFieldLabels = {
  name: string;
  namePlaceholder: string;
  instagram: string;
  instagramPlaceholder: string;
  country: string;
  countryPlaceholder: string;
  countrySearchPlaceholder: string;
  niches: string;
  nichesPlaceholder: string;
  nichesHint: string;
  quarters: string;
  quarterYear: string;
  quartersAdd: string;
  quartersEmpty: string;
  manager: string;
  managerPlaceholder: string;
  managerLoading: string;
  managerEmpty: string;
  outgoingEmail: string;
  outgoingEmailPlaceholder: string;
  externalLockedHint: string;
};

type LockedFields = {
  name?: boolean;
  instagram?: boolean;
  country?: boolean;
  niches?: boolean;
  managerId?: boolean;
  outgoingEmail?: boolean;
};

type TalentManagerFormFieldsProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  managers: InfluencerManager[];
  managersLoading?: boolean;
  disabled?: boolean;
  lockedFields?: LockedFields;
  labels: TalentManagerFieldLabels;
  locale: string;
  showName?: boolean;
  showInstagram?: boolean;
  showCountry?: boolean;
};

export function TalentManagerFormFields<TFieldValues extends FieldValues>({
  control,
  managers,
  managersLoading = false,
  disabled = false,
  lockedFields = {},
  labels,
  locale,
  showName = true,
  showInstagram = true,
  showCountry = true,
}: TalentManagerFormFieldsProps<TFieldValues>) {
  return (
    <>
      {showName ? (
        <div className="space-y-1">
          <TextFormField
            control={control}
            name={"name" as FieldPath<TFieldValues>}
            label={labels.name}
            placeholder={labels.namePlaceholder}
            disabled={disabled || lockedFields.name}
          />
          {lockedFields.name ? (
            <p className="text-xs text-muted-foreground">
              {labels.externalLockedHint}
            </p>
          ) : null}
        </div>
      ) : null}

      {showInstagram ? (
        <div className="space-y-1">
          <TextFormField
            control={control}
            name={"instagram" as FieldPath<TFieldValues>}
            label={labels.instagram}
            placeholder={labels.instagramPlaceholder}
            disabled={disabled || lockedFields.instagram}
          />
          {lockedFields.instagram ? (
            <p className="text-xs text-muted-foreground">
              {labels.externalLockedHint}
            </p>
          ) : null}
        </div>
      ) : null}

      {showCountry ? (
        <Controller
          control={control}
          name={"country" as FieldPath<TFieldValues>}
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <CountrySelect
                label={labels.country}
                placeholder={labels.countryPlaceholder}
                searchPlaceholder={labels.countrySearchPlaceholder}
                value={(field.value as string | undefined) ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled || lockedFields.country}
                error={fieldState.error?.message}
                locale={locale}
              />
              {lockedFields.country ? (
                <p className="text-xs text-muted-foreground">
                  {labels.externalLockedHint}
                </p>
              ) : null}
            </div>
          )}
        />
      ) : null}

      <Controller
        control={control}
        name={"quarters" as FieldPath<TFieldValues>}
        render={({ field, fieldState }) => (
          <QuartersPicker
            label={labels.quarters}
            yearLabel={labels.quarterYear}
            addLabel={labels.quartersAdd}
            emptyHint={labels.quartersEmpty}
            value={(field.value as QuarterAssignmentInput[] | undefined) ?? []}
            onChange={field.onChange}
            disabled={disabled}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name={"niches" as FieldPath<TFieldValues>}
        render={({ field, fieldState }) => (
          <div className="space-y-1">
            <TagsInput
              id="niches"
              label={labels.niches}
              placeholder={labels.nichesPlaceholder}
              hint={labels.nichesHint}
              value={(field.value as string[] | undefined) ?? []}
              onChange={field.onChange}
              disabled={disabled || lockedFields.niches}
              error={fieldState.error?.message}
            />
            {lockedFields.niches ? (
              <p className="text-xs text-muted-foreground">
                {labels.externalLockedHint}
              </p>
            ) : null}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"managerId" as FieldPath<TFieldValues>}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <Label htmlFor="managerId">{labels.manager}</Label>
            <select
              id="managerId"
              className={cn(selectClassName)}
              disabled={disabled || lockedFields.managerId || managersLoading}
              aria-invalid={Boolean(fieldState.error)}
              value={(field.value as string | undefined) ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            >
              <option value="">
                {managersLoading
                  ? labels.managerLoading
                  : managers.length === 0
                    ? labels.managerEmpty
                    : labels.managerPlaceholder}
              </option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>
            {lockedFields.managerId ? (
              <p className="text-xs text-muted-foreground">
                {labels.externalLockedHint}
              </p>
            ) : null}
            {fieldState.error?.message ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        )}
      />

      <div className="space-y-1">
        <TextFormField
          control={control}
          name={"outgoingEmail" as FieldPath<TFieldValues>}
          label={labels.outgoingEmail}
          type="email"
          placeholder={labels.outgoingEmailPlaceholder}
          disabled={disabled || lockedFields.outgoingEmail}
        />
        {lockedFields.outgoingEmail ? (
          <p className="text-xs text-muted-foreground">
            {labels.externalLockedHint}
          </p>
        ) : null}
      </div>
    </>
  );
}
