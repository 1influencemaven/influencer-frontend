"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { InfluencerFormFields } from "@/components/influencers/influencer-form-fields";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import {
  createUpdateInfluencerSchema,
  toUpdateInfluencerPayload,
  type UpdateInfluencerFormValues,
} from "@/schemas/update-influencer.schema";
import { getInfluencer, updateInfluencer } from "@/services/influencers.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";

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

type EditInfluencerFormProps = {
  influencerId: string;
};

export function EditInfluencerForm({ influencerId }: EditInfluencerFormProps) {
  const t = useTranslations("EditInfluencer");
  const createT = useTranslations("CreateInfluencer");
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoadingInfluencer, setIsLoadingInfluencer] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const schemaMessages = useInfluencerSchemaMessages();

  const updateInfluencerSchema = useMemo(
    () => createUpdateInfluencerSchema(schemaMessages),
    [schemaMessages],
  );

  const form = useForm<UpdateInfluencerFormValues>({
    resolver: zodResolver(updateInfluencerSchema),
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
      name: createT("nameLabel"),
      namePlaceholder: createT("namePlaceholder"),
      instagram: createT("instagramLabel"),
      instagramPlaceholder: createT("instagramPlaceholder"),
      tiktok: createT("tiktokLabel"),
      tiktokPlaceholder: createT("tiktokPlaceholder"),
      youtube: createT("youtubeLabel"),
      youtubePlaceholder: createT("youtubePlaceholder"),
      country: createT("countryLabel"),
      countryPlaceholder: createT("countryPlaceholder"),
      language: createT("languageLabel"),
      languagePlaceholder: createT("languagePlaceholder"),
      niche: createT("nicheLabel"),
      nichePlaceholder: createT("nichePlaceholder"),
      subNiche: createT("subNicheLabel"),
      subNichePlaceholder: createT("subNichePlaceholder"),
      followers: createT("followersLabel"),
      followersPlaceholder: createT("followersPlaceholder"),
      engagement: createT("engagementLabel"),
      engagementPlaceholder: createT("engagementPlaceholder"),
      email: createT("emailLabel"),
      emailPlaceholder: createT("emailPlaceholder"),
      mediaKitUrl: createT("mediaKitUrlLabel"),
      mediaKitUrlPlaceholder: createT("mediaKitUrlPlaceholder"),
    }),
    [createT],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadInfluencer() {
      setIsLoadingInfluencer(true);
      setLoadError(null);

      try {
        const influencer = await getInfluencer(influencerId);

        if (!isMounted) {
          return;
        }

        form.reset({
          name: influencer.name,
          instagram: influencer.instagram ?? "",
          tiktok: influencer.tiktok ?? "",
          youtube: influencer.youtube ?? "",
          country: influencer.country ?? "",
          language: influencer.language ?? "",
          niche: influencer.niche ?? "",
          subNiche: influencer.subNiche ?? "",
          followers:
            influencer.followers !== null && influencer.followers !== undefined
              ? String(influencer.followers)
              : "",
          engagement: influencer.engagement ?? "",
          email: influencer.email ?? "",
          mediaKitUrl: influencer.mediaKitUrl ?? "",
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (isApiError(error) && error.status === 404) {
          setLoadError(t("errors.notFound"));
        } else {
          setLoadError(getApiErrorMessage(error, t("errors.loadFailed")));
        }
      } finally {
        if (isMounted) {
          setIsLoadingInfluencer(false);
        }
      }
    }

    void loadInfluencer();

    return () => {
      isMounted = false;
    };
  }, [influencerId, form, t]);

  async function onSubmit(values: UpdateInfluencerFormValues) {
    setApiError(null);

    try {
      await updateInfluencer(
        influencerId,
        toUpdateInfluencerPayload(values),
      );
      router.replace(`/dashboard/creators/${influencerId}`);
    } catch (error) {
      if (isApiError(error) && error.status === 404) {
        setApiError(t("errors.notFound"));
      } else {
        setApiError(getApiErrorMessage(error, t("errors.generic")));
      }
    }
  }

  if (isLoadingInfluencer) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/creators">{t("backToList")}</Link>
        </Button>
      </section>
    );
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
          <Link href={`/dashboard/creators/${influencerId}`}>{t("cancel")}</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
