"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { InstagramUsernameResearchPanel } from "@/components/influencers/instagram-username-research-panel";
import {
  TalentManagerFormFields,
  type TalentManagerFieldLabels,
} from "@/components/influencers/talent-manager-form-fields";
import { Button } from "@/components/ui/button";
import { useInfluencerManagers } from "@/hooks/use-influencer-managers";
import { Link, useRouter } from "@/i18n/navigation";
import { invalidateInfluencerQueries } from "@/lib/influencer-query-keys";
import {
  createCreateInfluencerSchema,
  toCreateInfluencerPayload,
  toInstagramResearchCreatePayload,
  type CreateInfluencerFormInput,
  type CreateInfluencerFormValues,
} from "@/schemas/create-influencer.schema";
import { createInfluencer } from "@/services/influencers.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type {
  InstagramResearchCreatePayload,
  InstagramUsernameResearchResponse,
} from "@/types/influencer";

function useTalentManagerSchemaMessages() {
  const t = useTranslations("CreateInfluencer.errors");

  return useMemo(
    () => ({
      nameRequired: t("nameRequired"),
      nameMin: t("nameMin"),
      nameMax: t("nameMax"),
      instagramRequired: t("instagramRequired"),
      instagramMax: t("instagramMax"),
      countryRequired: t("countryRequired"),
      countryInvalid: t("countryInvalid"),
      nicheItemMax: t("nicheItemMax"),
      nichesMax: t("nichesMax"),
      quarterYearInvalid: t("quarterYearInvalid"),
      quartersDuplicate: t("quartersDuplicate"),
      outgoingEmailInvalid: t("outgoingEmailInvalid"),
      managerIdRequired: t("managerIdRequired"),
      managerIdInvalid: t("managerIdInvalid"),
    }),
    [t],
  );
}

export function CreateInfluencerForm() {
  const t = useTranslations("CreateInfluencer");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<string | null>(null);
  const [instagramResearch, setInstagramResearch] =
    useState<InstagramResearchCreatePayload | null>(null);
  const schemaMessages = useTalentManagerSchemaMessages();
  const managersQuery = useInfluencerManagers();

  const createInfluencerSchema = useMemo(
    () => createCreateInfluencerSchema(schemaMessages),
    [schemaMessages],
  );

  const form = useForm<CreateInfluencerFormInput, unknown, CreateInfluencerFormValues>({
    resolver: zodResolver(createInfluencerSchema),
    defaultValues: {
      name: "",
      instagram: "",
      country: "",
      niches: [],
      quarters: [],
      managerId: "",
      outgoingEmail: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof createInfluencer>[0]) =>
      createInfluencer(payload),
    onSuccess: async (influencer) => {
      await invalidateInfluencerQueries(queryClient, influencer.id);
      router.replace(`/dashboard/creators/${influencer.id}`);
    },
  });

  const isSubmitting = mutation.isPending || form.formState.isSubmitting;

  const fieldLabels = useMemo<TalentManagerFieldLabels>(
    () => ({
      name: t("nameLabel"),
      namePlaceholder: t("namePlaceholder"),
      instagram: t("instagramLabel"),
      instagramPlaceholder: t("instagramPlaceholder"),
      country: t("countryLocationLabel"),
      countryPlaceholder: t("countrySelectPlaceholder"),
      countrySearchPlaceholder: t("countrySearchPlaceholder"),
      niches: t("nichesLabel"),
      nichesPlaceholder: t("nichesPlaceholder"),
      nichesHint: t("nichesHint"),
      quarters: t("quartersLabel"),
      quarterYear: t("quarterYearLabel"),
      quartersAdd: t("quartersAdd"),
      quartersEmpty: t("quartersEmpty"),
      manager: t("managerLabel"),
      managerPlaceholder: t("managerPlaceholder"),
      managerLoading: t("managerLoading"),
      managerEmpty: t("managerEmpty"),
      outgoingEmail: t("outgoingEmailLabel"),
      outgoingEmailPlaceholder: t("outgoingEmailPlaceholder"),
      externalLockedHint: t("externalLockedHint"),
    }),
    [t],
  );

  function applyResearchToForm(lookup: InstagramUsernameResearchResponse) {
    const handle = lookup.research.handleNormalized;
    form.setValue("instagram", `@${handle}`, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (lookup.normalized.displayName) {
      form.setValue("name", lookup.normalized.displayName, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    // Keep full research package for create persistence / Mastra.
    // Do not auto-fill niches from hashtags.
    setInstagramResearch(toInstagramResearchCreatePayload(lookup));
  }

  async function onSubmit(values: CreateInfluencerFormValues) {
    setApiError(null);

    try {
      await mutation.mutateAsync(
        toCreateInfluencerPayload(values, { instagramResearch }),
      );
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setApiError(t("errors.instagramConflict"));
      } else {
        setApiError(getApiErrorMessage(error, t("errors.generic")));
      }
    }
  }

  return (
    <form
      className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FormErrorAlert message={apiError ?? ""} />

      <div className="space-y-1">
        <InstagramUsernameResearchPanel
          disabled={isSubmitting}
          username={form.watch("instagram")}
          onUsernameChange={(value) =>
            form.setValue("instagram", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          onFound={applyResearchToForm}
        />
        {form.formState.errors.instagram?.message ? (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.instagram.message}
          </p>
        ) : null}
      </div>

      <TalentManagerFormFields
        control={form.control}
        managers={managersQuery.data ?? []}
        managersLoading={managersQuery.isLoading}
        disabled={isSubmitting}
        labels={fieldLabels}
        locale={locale}
        showInstagram={false}
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
