"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { TextFormField } from "@/components/forms/text-form-field";

type InfluencerFormFieldsProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  disabled?: boolean;
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

export function InfluencerFormFields<TFieldValues extends FieldValues>({
  control,
  disabled = false,
  labels,
}: InfluencerFormFieldsProps<TFieldValues>) {
  return (
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
        <TextFormField
          control={control}
          name={"tiktok" as FieldPath<TFieldValues>}
          label={labels.tiktok}
          placeholder={labels.tiktokPlaceholder}
          disabled={disabled}
        />
        <TextFormField
          control={control}
          name={"youtube" as FieldPath<TFieldValues>}
          label={labels.youtube}
          placeholder={labels.youtubePlaceholder}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextFormField
          control={control}
          name={"country" as FieldPath<TFieldValues>}
          label={labels.country}
          placeholder={labels.countryPlaceholder}
          disabled={disabled}
        />
        <TextFormField
          control={control}
          name={"language" as FieldPath<TFieldValues>}
          label={labels.language}
          placeholder={labels.languagePlaceholder}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextFormField
          control={control}
          name={"niche" as FieldPath<TFieldValues>}
          label={labels.niche}
          placeholder={labels.nichePlaceholder}
          disabled={disabled}
        />
        <TextFormField
          control={control}
          name={"subNiche" as FieldPath<TFieldValues>}
          label={labels.subNiche}
          placeholder={labels.subNichePlaceholder}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextFormField
          control={control}
          name={"followers" as FieldPath<TFieldValues>}
          label={labels.followers}
          type="number"
          placeholder={labels.followersPlaceholder}
          disabled={disabled}
        />
        <TextFormField
          control={control}
          name={"engagement" as FieldPath<TFieldValues>}
          label={labels.engagement}
          type="number"
          placeholder={labels.engagementPlaceholder}
          disabled={disabled}
        />
      </div>

      <TextFormField
        control={control}
        name={"email" as FieldPath<TFieldValues>}
        label={labels.email}
        type="email"
        placeholder={labels.emailPlaceholder}
        disabled={disabled}
      />

      <TextFormField
        control={control}
        name={"mediaKitUrl" as FieldPath<TFieldValues>}
        label={labels.mediaKitUrl}
        type="url"
        placeholder={labels.mediaKitUrlPlaceholder}
        disabled={disabled}
      />
    </>
  );
}
