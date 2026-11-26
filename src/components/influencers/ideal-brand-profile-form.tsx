"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { invalidateInfluencerQueries } from "@/lib/influencer-query-keys";
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
      <Textarea id={id} rows={4} className="min-h-24" {...register(id)} />
      <p className="text-xs text-muted-foreground">{hint}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function ViewListField({
  label,
  values,
  emptyLabel,
}: {
  label: string;
  values: string[];
  emptyLabel: string;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{label}</h4>
      {values.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {values.map((value) => (
            <li
              key={`${label}:${value}`}
              className="rounded-md border border-border/70 px-2.5 py-1 text-sm"
            >
              {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IdealBrandProfileReadonly({
  profile,
  onEdit,
}: {
  profile: IdealBrandProfile;
  onEdit: () => void;
}) {
  const t = useTranslations("IdealBrandProfile.form");

  return (
    <section className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{t("viewTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("viewDescription")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={onEdit}
        >
          <Pencil className="size-3.5" aria-hidden />
          {t("edit")}
        </Button>
      </div>

      <ViewListField
        label={t("targetSectors")}
        values={profile.targetSectors}
        emptyLabel={t("emptyValue")}
      />
      <ViewListField
        label={t("excludedSectors")}
        values={profile.excludedSectors}
        emptyLabel={t("emptyValue")}
      />
      <ViewListField
        label={t("brandSize")}
        values={profile.brandSize}
        emptyLabel={t("emptyValue")}
      />
      <ViewListField
        label={t("markets")}
        values={profile.markets}
        emptyLabel={t("emptyValue")}
      />
      <ViewListField
        label={t("collaborationTypes")}
        values={profile.collaborationTypes}
        emptyLabel={t("emptyValue")}
      />

      <div className="space-y-1">
        <h4 className="text-sm font-medium">{t("summary")}</h4>
        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
          {profile.summary.trim() ? profile.summary : t("emptyValue")}
        </p>
      </div>

      <ViewListField
        label={t("alertSignals")}
        values={profile.alertSignals}
        emptyLabel={t("emptyValue")}
      />
      <ViewListField
        label={t("desirableCriteria")}
        values={profile.desirableCriteria}
        emptyLabel={t("emptyValue")}
      />
    </section>
  );
}

export function IdealBrandProfileForm({
  influencerId,
  profile,
  onSaved,
}: IdealBrandProfileFormProps) {
  const t = useTranslations("IdealBrandProfile.form");
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
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

  function handleCancel() {
    reset(ibpToFormValues(profile));
    setIsEditing(false);
  }

  async function onSubmit(values: IdealBrandProfileFormValues) {
    try {
      const saved = await saveIdealBrandProfile(
        influencerId,
        formValuesToPayload(values),
      );
      onSaved(saved);
      setIsEditing(false);
      await invalidateInfluencerQueries(queryClient, influencerId);
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

  if (!isEditing) {
    return (
      <IdealBrandProfileReadonly
        profile={profile}
        onEdit={() => setIsEditing(true)}
      />
    );
  }

  return (
    <form
      className="space-y-5 rounded-lg border border-border p-4"
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{t("editTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("arrayHint")}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSubmitting}
          onClick={handleCancel}
        >
          {t("cancel")}
        </Button>
      </div>

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

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("saving") : t("save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={handleCancel}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
