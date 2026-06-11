"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectFormField } from "@/components/forms/select-form-field";
import { TextFormField } from "@/components/forms/text-form-field";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { USER_ROLES } from "@/lib/auth/roles";
import {
  createCreateUserSchema,
  type CreateUserFormValues,
} from "@/schemas/create-user.schema";
import { createUser } from "@/services/users.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";

export function CreateUserForm() {
  const t = useTranslations("CreateUser");
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const createUserSchema = useMemo(
    () =>
      createCreateUserSchema({
        nameRequired: t("errors.nameRequired"),
        nameMin: t("errors.nameMin"),
        nameMax: t("errors.nameMax"),
        emailRequired: t("errors.emailRequired"),
        emailInvalid: t("errors.emailInvalid"),
        passwordRequired: t("errors.passwordRequired"),
        passwordMin: t("errors.passwordMin"),
        roleRequired: t("errors.roleRequired"),
      }),
    [t],
  );

  const roleOptions = useMemo(
    () =>
      USER_ROLES.map((role) => ({
        value: role,
        label: t(`roles.${role}`),
      })),
    [t],
  );

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: CreateUserFormValues) {
    setApiError(null);

    try {
      await createUser(values);
      router.replace("/users");
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setApiError(t("errors.emailConflict"));
      } else if (isApiError(error) && error.status === 403) {
        setApiError(t("errors.forbidden"));
      } else {
        setApiError(getApiErrorMessage(error, t("errors.generic")));
      }
    }
  }

  return (
    <form
      className="mx-auto max-w-lg space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FormErrorAlert message={apiError ?? ""} />

      <TextFormField
        control={form.control}
        name="name"
        label={t("nameLabel")}
        placeholder={t("namePlaceholder")}
        autoComplete="name"
        disabled={isSubmitting}
      />

      <TextFormField
        control={form.control}
        name="email"
        label={t("emailLabel")}
        type="email"
        placeholder={t("emailPlaceholder")}
        autoComplete="email"
        disabled={isSubmitting}
      />

      <TextFormField
        control={form.control}
        name="password"
        label={t("passwordLabel")}
        type="password"
        placeholder={t("passwordPlaceholder")}
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      <SelectFormField
        control={form.control}
        name="role"
        label={t("roleLabel")}
        options={roleOptions}
        disabled={isSubmitting}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild>
          <Link href="/users">{t("cancel")}</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
