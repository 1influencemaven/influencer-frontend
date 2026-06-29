"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { InfluencerFormFields } from "@/components/influencers/influencer-form-fields";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import {
  createCreateInfluencerSchema,
  toCreateInfluencerPayload,
  type CreateInfluencerFormValues,
} from "@/schemas/create-influencer.schema";
import { createInfluencer } from "@/services/influencers.service";
import { getApiErrorMessage } from "@/types/api-error";

function useInfluencerSchemaMessages() {
  const t = useTranslations("CreateInfluencer.errors");

  return useMemo(
    () => ({
      nameRequired: t("nameRequired"),
      nameMin: t("nameMin"),
      nameMax: t("nameMax"),
      instagramMax: t("instagramMax"),
      tiktokMax: t("tiktokMax"),
      youtubeMax: t("youtubeMax"),
      countryLength: t("countryLength"),
      languageLength: t("languageLength"),
      nicheMax: t("nicheMax"),
      subNicheMax: t("subNicheMax"),
      followersMin: t("followersMin"),
      followersInt: t("followersInt"),
      engagementMin: t("engagementMin"),
      engagementMax: t("engagementMax"),
      engagementDecimals: t("engagementDecimals"),
      emailInvalid: t("emailInvalid"),
      mediaKitUrlInvalid: t("mediaKitUrlInvalid"),
      mediaKitUrlMax: t("mediaKitUrlMax"),
    }),
    [t],
  );
}

export function CreateInfluencerForm() {
  const t = useTranslations("CreateInfluencer");
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const schemaMessages = useInfluencerSchemaMessages();

  const createInfluencerSchema = useMemo(
    () => createCreateInfluencerSchema(schemaMessages),
    [schemaMessages],
  );

  const form = useForm<CreateInfluencerFormValues>({
    resolver: zodResolver(createInfluencerSchema),
    defaultValues: {
      name: "",
      instagram: "",
      tiktok: "",
      youtube: "",
      country: "",
      language: "",
      niche: "",
      subNiche: "",
      followers: "",
      engagement: "",
      email: "",
      mediaKitUrl: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const fieldLabels = useMemo(
    () => ({
      name: t("nameLabel"),
      namePlaceholder: t("namePlaceholder"),
      instagram: t("instagramLabel"),
      instagramPlaceholder: t("instagramPlaceholder"),
      tiktok: t("tiktokLabel"),
      tiktokPlaceholder: t("tiktokPlaceholder"),
      youtube: t("youtubeLabel"),
      youtubePlaceholder: t("youtubePlaceholder"),
      country: t("countryLabel"),
      countryPlaceholder: t("countryPlaceholder"),
      language: t("languageLabel"),
      languagePlaceholder: t("languagePlaceholder"),
      niche: t("nicheLabel"),
      nichePlaceholder: t("nichePlaceholder"),
      subNiche: t("subNicheLabel"),
      subNichePlaceholder: t("subNichePlaceholder"),
      followers: t("followersLabel"),
      followersPlaceholder: t("followersPlaceholder"),
      engagement: t("engagementLabel"),
      engagementPlaceholder: t("engagementPlaceholder"),
      email: t("emailLabel"),
      emailPlaceholder: t("emailPlaceholder"),
      mediaKitUrl: t("mediaKitUrlLabel"),
      mediaKitUrlPlaceholder: t("mediaKitUrlPlaceholder"),
    }),
    [t],
  );

  async function onSubmit(values: CreateInfluencerFormValues) {
    setApiError(null);

    try {
      const influencer = await createInfluencer(toCreateInfluencerPayload(values));
      router.replace(`/dashboard/creators/${influencer.id}`);
    } catch (error) {
      setApiError(getApiErrorMessage(error, t("errors.generic")));
    }
  }

  return (
    <form
      className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FormErrorAlert message={apiError ?? ""} />

      <InfluencerFormFields
        control={form.control}
        disabled={isSubmitting}
        labels={fieldLabels}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/creators">{t("cancel")}</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
