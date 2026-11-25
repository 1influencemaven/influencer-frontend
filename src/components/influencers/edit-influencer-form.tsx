"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { InfluencerFormFields } from "@/components/influencers/influencer-form-fields";
import {
  TalentManagerFormFields,
  type TalentManagerFieldLabels,
} from "@/components/influencers/talent-manager-form-fields";
import { Button } from "@/components/ui/button";
import { useInfluencerManagers } from "@/hooks/use-influencer-managers";
import { Link, useRouter } from "@/i18n/navigation";
import { isExternallyManagedField } from "@/lib/influencer-provenance";
import {
  influencerKeys,
  invalidateInfluencerQueries,
} from "@/lib/influencer-query-keys";
import {
  createUpdateInfluencerSchema,
  toUpdateInfluencerPayload,
  type UpdateInfluencerFormInput,
  type UpdateInfluencerFormValues,
} from "@/schemas/update-influencer.schema";
import { getInfluencer, updateInfluencer } from "@/services/influencers.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import {
  INFLUENCER_FIELD_KEYS,
  type InfluencerFieldKey,
} from "@/types/influencer";

function useUpdateSchemaMessages() {
  const t = useTranslations("CreateInfluencer.errors");

  return useMemo(
    () => ({
      nameRequired: t("nameRequired"),
      nameMin: t("nameMin"),
      nameMax: t("nameMax"),
      instagramRequired: t("instagramRequired"),
      instagramMax: t("instagramMax"),
      nicheItemMax: t("nicheItemMax"),
      nichesMax: t("nichesMax"),
      quarterYearInvalid: t("quarterYearInvalid"),
      quartersDuplicate: t("quartersDuplicate"),
      outgoingEmailInvalid: t("outgoingEmailInvalid"),
      managerIdRequired: t("managerIdRequired"),
      managerIdInvalid: t("managerIdInvalid"),
      tiktokMax: t("tiktokMax"),
      youtubeMax: t("youtubeMax"),
      countryRequired: t("countryRequired"),
      countryLength: t("countryLength"),
      countryInvalid: t("countryInvalid"),
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
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const schemaMessages = useUpdateSchemaMessages();
  const managersQuery = useInfluencerManagers();

  const updateInfluencerSchema = useMemo(
    () => createUpdateInfluencerSchema(schemaMessages),
    [schemaMessages],
  );

  const form = useForm<UpdateInfluencerFormInput, unknown, UpdateInfluencerFormValues>({
    resolver: zodResolver(updateInfluencerSchema),
    defaultValues: {
      name: "",
      instagram: "",
      niches: [],
      quarters: [],
      managerId: "",
      outgoingEmail: "",
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

  const detailQuery = useQuery({
    queryKey: influencerKeys.detail(influencerId),
    queryFn: () => getInfluencer(influencerId),
  });

  const influencer = detailQuery.data;
  const provenances = influencer?.fieldProvenances;

  const lockedFields = useMemo(() => {
    const keys = Object.values(INFLUENCER_FIELD_KEYS);
    const locked = new Set<InfluencerFieldKey | string>();
    for (const key of keys) {
      if (isExternallyManagedField(provenances, key)) {
        locked.add(key);
      }
    }
    return locked;
  }, [provenances]);

  const mutation = useMutation({
    mutationFn: (values: UpdateInfluencerFormValues) =>
      updateInfluencer(
        influencerId,
        toUpdateInfluencerPayload(values, { lockedFields }),
      ),
    onSuccess: async () => {
      await invalidateInfluencerQueries(queryClient, influencerId);
      router.replace(`/dashboard/creators/${influencerId}`);
    },
  });

  useEffect(() => {
    if (!influencer) {
      return;
    }

    form.reset({
      name: influencer.name,
      instagram: influencer.instagram ?? "",
      niches: influencer.niches ?? [],
      quarters: (influencer.quarterAssignments ?? []).map((item) => ({
        year: item.year,
        quarter: item.quarter,
      })),
      managerId: influencer.managerId ?? "",
      outgoingEmail: influencer.outgoingEmail ?? "",
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
  }, [influencer, form]);

  const isSubmitting = mutation.isPending || form.formState.isSubmitting;

  const tmLabels = useMemo<TalentManagerFieldLabels>(
    () => ({
      name: createT("nameLabel"),
      namePlaceholder: createT("namePlaceholder"),
      instagram: createT("instagramLabel"),
      instagramPlaceholder: createT("instagramPlaceholder"),
      country: createT("countryLocationLabel"),
      countryPlaceholder: createT("countrySelectPlaceholder"),
      countrySearchPlaceholder: createT("countrySearchPlaceholder"),
      niches: createT("nichesLabel"),
      nichesPlaceholder: createT("nichesPlaceholder"),
      nichesHint: createT("nichesHint"),
      quarters: createT("quartersLabel"),
      quarterYear: createT("quarterYearLabel"),
      quartersAdd: createT("quartersAdd"),
      quartersEmpty: createT("quartersEmpty"),
      manager: createT("managerLabel"),
      managerPlaceholder: createT("managerPlaceholder"),
      managerLoading: createT("managerLoading"),
      managerEmpty: createT("managerEmpty"),
      outgoingEmail: createT("outgoingEmailLabel"),
      outgoingEmailPlaceholder: createT("outgoingEmailPlaceholder"),
      externalLockedHint: createT("externalLockedHint"),
    }),
    [createT],
  );

  const legacyLabels = useMemo(
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

  async function onSubmit(values: UpdateInfluencerFormValues) {
    setApiError(null);

    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      if (isApiError(error) && error.status === 404) {
        setApiError(t("errors.notFound"));
      } else if (isApiError(error) && error.status === 409) {
        setApiError(createT("errors.instagramConflict"));
      } else {
        setApiError(getApiErrorMessage(error, t("errors.generic")));
      }
    }
  }

  if (detailQuery.isLoading) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </section>
    );
  }

  if (detailQuery.error || !influencer) {
    const loadError =
      isApiError(detailQuery.error) && detailQuery.error.status === 404
        ? t("errors.notFound")
        : getApiErrorMessage(detailQuery.error, t("errors.loadFailed"));

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

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {t("sections.talentManager")}
        </h2>
        <TalentManagerFormFields
          control={form.control}
          managers={managersQuery.data ?? []}
          managersLoading={managersQuery.isLoading}
          disabled={isSubmitting}
          labels={tmLabels}
          locale={locale}
          lockedFields={{
            name: lockedFields.has(INFLUENCER_FIELD_KEYS.NAME),
            instagram: lockedFields.has(INFLUENCER_FIELD_KEYS.INSTAGRAM),
            country: lockedFields.has(INFLUENCER_FIELD_KEYS.COUNTRY),
            niches: lockedFields.has(INFLUENCER_FIELD_KEYS.NICHES),
            managerId: lockedFields.has(INFLUENCER_FIELD_KEYS.MANAGER_ID),
            outgoingEmail: lockedFields.has(
              INFLUENCER_FIELD_KEYS.OUTGOING_EMAIL,
            ),
          }}
        />
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {t("sections.legacy")}
        </h2>
        <InfluencerFormFields
          control={form.control}
          disabled={isSubmitting}
          hideIdentityFields
          hideCountry
          lockedFields={{
            tiktok: lockedFields.has(INFLUENCER_FIELD_KEYS.TIKTOK),
            youtube: lockedFields.has(INFLUENCER_FIELD_KEYS.YOUTUBE),
            language: lockedFields.has(INFLUENCER_FIELD_KEYS.LANGUAGE),
            niche: lockedFields.has(INFLUENCER_FIELD_KEYS.NICHE),
            subNiche: lockedFields.has(INFLUENCER_FIELD_KEYS.SUB_NICHE),
            followers: lockedFields.has(INFLUENCER_FIELD_KEYS.FOLLOWERS),
            engagement: lockedFields.has(INFLUENCER_FIELD_KEYS.ENGAGEMENT),
            email: lockedFields.has(INFLUENCER_FIELD_KEYS.EMAIL),
            mediaKitUrl: lockedFields.has(INFLUENCER_FIELD_KEYS.MEDIA_KIT_URL),
          }}
          externalLockedHint={createT("externalLockedHint")}
          labels={legacyLabels}
        />
      </section>

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
