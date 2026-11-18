"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { TextFormField } from "@/components/forms/text-form-field";

type InfluencerFormFieldsProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  disabled?: boolean;
  hideIdentityFields?: boolean;
  /** When true, country is edited in Talent Manager fields (searchable ISO select). */
  hideCountry?: boolean;
  lockedFields?: {
    tiktok?: boolean;
    youtube?: boolean;
    country?: boolean;
    language?: boolean;
    niche?: boolean;
    subNiche?: boolean;
    followers?: boolean;
    engagement?: boolean;
    email?: boolean;
    mediaKitUrl?: boolean;
  };
  externalLockedHint?: string;
  labels: {
    name: string;
    namePlaceholder: string;
    instagram: string;
    instagramPlaceholder: string;
    tiktok: string;
    tiktokPlaceholder: string;
    youtube: string;
    youtubePlaceholder: string;
    country: string;
    countryPlaceholder: string;
    language: string;
    languagePlaceholder: string;
    niche: string;
    nichePlaceholder: string;
    subNiche: string;
    subNichePlaceholder: string;
    followers: string;
    followersPlaceholder: string;
    engagement: string;
    engagementPlaceholder: string;
    email: string;
    emailPlaceholder: string;
    mediaKitUrl: string;
    mediaKitUrlPlaceholder: string;
  };
};

function LockedHint({
  locked,
  message,
}: {
  locked?: boolean;
  message?: string;
}) {
  if (!locked || !message) {
    return null;
  }

  return <p className="text-xs text-muted-foreground">{message}</p>;
}

export function InfluencerFormFields<TFieldValues extends FieldValues>({
  control,
  disabled = false,
  hideIdentityFields = false,
  hideCountry = false,
  lockedFields = {},
  externalLockedHint,
  labels,
}: InfluencerFormFieldsProps<TFieldValues>) {
  return (
    <>
      {!hideIdentityFields ? (
        <>
          <TextFormField
            control={control}
            name={"name" as FieldPath<TFieldValues>}
            label={labels.name}
            placeholder={labels.namePlaceholder}
            disabled={disabled}
          />

          <div className="grid gap-6 sm:grid-cols-3">
            <TextFormField
              control={control}
              name={"instagram" as FieldPath<TFieldValues>}
              label={labels.instagram}
              placeholder={labels.instagramPlaceholder}
              disabled={disabled}
            />
            <div className="space-y-1">
              <TextFormField
                control={control}
                name={"tiktok" as FieldPath<TFieldValues>}
                label={labels.tiktok}
                placeholder={labels.tiktokPlaceholder}
                disabled={disabled || lockedFields.tiktok}
              />
              <LockedHint
                locked={lockedFields.tiktok}
                message={externalLockedHint}
              />
            </div>
            <div className="space-y-1">
              <TextFormField
                control={control}
                name={"youtube" as FieldPath<TFieldValues>}
                label={labels.youtube}
                placeholder={labels.youtubePlaceholder}
                disabled={disabled || lockedFields.youtube}
              />
              <LockedHint
                locked={lockedFields.youtube}
                message={externalLockedHint}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <TextFormField
              control={control}
              name={"tiktok" as FieldPath<TFieldValues>}
              label={labels.tiktok}
              placeholder={labels.tiktokPlaceholder}
              disabled={disabled || lockedFields.tiktok}
            />
            <LockedHint
              locked={lockedFields.tiktok}
              message={externalLockedHint}
            />
          </div>
          <div className="space-y-1">
            <TextFormField
              control={control}
              name={"youtube" as FieldPath<TFieldValues>}
              label={labels.youtube}
              placeholder={labels.youtubePlaceholder}
              disabled={disabled || lockedFields.youtube}
            />
            <LockedHint
              locked={lockedFields.youtube}
              message={externalLockedHint}
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {hideCountry ? null : (
          <div className="space-y-1">
            <TextFormField
              control={control}
              name={"country" as FieldPath<TFieldValues>}
              label={labels.country}
              placeholder={labels.countryPlaceholder}
              disabled={disabled || lockedFields.country}
            />
            <LockedHint
              locked={lockedFields.country}
              message={externalLockedHint}
            />
          </div>
        )}
        <div className="space-y-1">
          <TextFormField
            control={control}
            name={"language" as FieldPath<TFieldValues>}
            label={labels.language}
            placeholder={labels.languagePlaceholder}
            disabled={disabled || lockedFields.language}
          />
          <LockedHint
            locked={lockedFields.language}
            message={externalLockedHint}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1">
          <TextFormField
            control={control}
            name={"niche" as FieldPath<TFieldValues>}
            label={labels.niche}
            placeholder={labels.nichePlaceholder}
            disabled={disabled || lockedFields.niche}
          />
          <LockedHint locked={lockedFields.niche} message={externalLockedHint} />
        </div>
        <div className="space-y-1">
          <TextFormField
            control={control}
            name={"subNiche" as FieldPath<TFieldValues>}
            label={labels.subNiche}
            placeholder={labels.subNichePlaceholder}
            disabled={disabled || lockedFields.subNiche}
          />
          <LockedHint
            locked={lockedFields.subNiche}
            message={externalLockedHint}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1">
          <TextFormField
            control={control}
            name={"followers" as FieldPath<TFieldValues>}
            label={labels.followers}
            type="number"
            placeholder={labels.followersPlaceholder}
            disabled={disabled || lockedFields.followers}
          />
          <LockedHint
            locked={lockedFields.followers}
            message={externalLockedHint}
          />
        </div>
        <div className="space-y-1">
          <TextFormField
            control={control}
            name={"engagement" as FieldPath<TFieldValues>}
            label={labels.engagement}
            type="number"
            placeholder={labels.engagementPlaceholder}
            disabled={disabled || lockedFields.engagement}
          />
          <LockedHint
            locked={lockedFields.engagement}
            message={externalLockedHint}
          />
        </div>
      </div>

      <div className="space-y-1">
        <TextFormField
          control={control}
          name={"email" as FieldPath<TFieldValues>}
          label={labels.email}
          type="email"
          placeholder={labels.emailPlaceholder}
          disabled={disabled || lockedFields.email}
        />
        <LockedHint locked={lockedFields.email} message={externalLockedHint} />
      </div>

      <div className="space-y-1">
        <TextFormField
          control={control}
          name={"mediaKitUrl" as FieldPath<TFieldValues>}
          label={labels.mediaKitUrl}
          type="url"
          placeholder={labels.mediaKitUrlPlaceholder}
          disabled={disabled || lockedFields.mediaKitUrl}
        />
        <LockedHint
          locked={lockedFields.mediaKitUrl}
          message={externalLockedHint}
        />
      </div>
    </>
  );
}
