"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formValuesToPayload,
  ibpToFormValues,
  idealBrandProfileFormSchema,
  type IdealBrandProfileFormValues,
} from "@/schemas/ideal-brand-profile.schema";
import { saveIdealBrandProfile } from "@/services/ideal-brand-profiles.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type { IdealBrandProfile } from "@/types/ideal-brand-profile";

type IdealBrandProfileFormProps = {
  influencerId: string;
  profile: IdealBrandProfile;
  onSaved: (profile: IdealBrandProfile) => void;
};

function ArrayField({
  id,
  label,
  hint,
  error,
  register,
}: {
  id: keyof IdealBrandProfileFormValues;
  label: string;
  hint: string;
  error?: string;
  register: ReturnType<typeof useForm<IdealBrandProfileFormValues>>["register"];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        rows={4}
        className="min-h-24"
        {...register(id)}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function IdealBrandProfileForm({
  influencerId,
  profile,
  onSaved,
}: IdealBrandProfileFormProps) {
  const t = useTranslations("IdealBrandProfile.form");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<IdealBrandProfileFormValues>({
    resolver: zodResolver(idealBrandProfileFormSchema),
    defaultValues: ibpToFormValues(profile),
  });

  useEffect(() => {
    reset(ibpToFormValues(profile));
  }, [profile, reset]);

  async function onSubmit(values: IdealBrandProfileFormValues) {
    try {
      const saved = await saveIdealBrandProfile(
        influencerId,
        formValuesToPayload(values),
      );
      onSaved(saved);
    } catch (saveError) {
      if (isApiError(saveError) && saveError.status === 409) {
        setError("root", { message: t("errors.processing") });
      } else {
        setError("root", {
          message: getApiErrorMessage(saveError, t("errors.generic")),
        });
      }
    }
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <ArrayField
        id="targetSectors"
        label={t("targetSectors")}
        hint={t("arrayHint")}
        error={errors.targetSectors?.message ? t("errors.required") : undefined}
        register={register}
      />
      <ArrayField
        id="excludedSectors"
        label={t("excludedSectors")}
        hint={t("arrayHint")}
        register={register}
      />
      <ArrayField
        id="brandSize"
        label={t("brandSize")}
        hint={t("arrayHint")}
        error={errors.brandSize?.message ? t("errors.required") : undefined}
        register={register}
      />
      <ArrayField
        id="markets"
        label={t("markets")}
        hint={t("arrayHint")}
        error={errors.markets?.message ? t("errors.required") : undefined}
        register={register}
      />
      <ArrayField
        id="collaborationTypes"
        label={t("collaborationTypes")}
        hint={t("arrayHint")}
        error={
          errors.collaborationTypes?.message ? t("errors.required") : undefined
        }
        register={register}
      />

      <div className="space-y-2">
        <Label htmlFor="summary">{t("summary")}</Label>
        <Textarea id="summary" rows={4} {...register("summary")} />
        {errors.summary ? (
          <p className="text-sm text-destructive">{t("errors.required")}</p>
        ) : null}
      </div>

      <ArrayField
        id="alertSignals"
        label={t("alertSignals")}
        hint={t("arrayHint")}
        register={register}
      />
      <ArrayField
        id="desirableCriteria"
        label={t("desirableCriteria")}
        hint={t("arrayHint")}
        register={register}
      />

      {errors.root ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.root.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
