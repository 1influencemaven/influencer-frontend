"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectFormField } from "@/components/forms/select-form-field";
import { TextFormField } from "@/components/forms/text-form-field";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { USER_ROLES } from "@/lib/auth/roles";
import {
  createUpdateUserSchema,
  type UpdateUserFormValues,
} from "@/schemas/update-user.schema";
import { getUser, updateUser } from "@/services/users.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";

type EditUserFormProps = {
  userId: string;
};

export function EditUserForm({ userId }: EditUserFormProps) {
  const t = useTranslations("EditUser");
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const updateUserSchema = useMemo(
    () =>
      createUpdateUserSchema({
        nameRequired: t("errors.nameRequired"),
        nameMin: t("errors.nameMin"),
        nameMax: t("errors.nameMax"),
        emailRequired: t("errors.emailRequired"),
        emailInvalid: t("errors.emailInvalid"),
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

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      setIsLoadingUser(true);
      setLoadError(null);

      try {
        const user = await getUser(userId);

        if (!isMounted) {
          return;
        }

        form.reset({
          name: user.name,
          email: user.email,
          password: "",
          role: user.role,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (isApiError(error) && error.status === 404) {
          setLoadError(t("errors.notFound"));
        } else if (isApiError(error) && error.status === 403) {
          setLoadError(t("errors.forbidden"));
        } else {
          setLoadError(getApiErrorMessage(error, t("errors.loadFailed")));
        }
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  async function onSubmit(values: UpdateUserFormValues) {
    setApiError(null);

    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
      ...(values.password ? { password: values.password } : {}),
    };

    try {
      await updateUser(userId, payload);
      router.replace("/users");
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setApiError(t("errors.emailConflict"));
      } else if (isApiError(error) && error.status === 403) {
        setApiError(t("errors.forbidden"));
      } else if (isApiError(error) && error.status === 404) {
        setApiError(t("errors.notFound"));
      } else {
        setApiError(getApiErrorMessage(error, t("errors.generic")));
      }
    }
  }

  if (isLoadingUser) {
    return (
      <section className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="mx-auto max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button asChild variant="outline">
          <Link href="/users">{t("backToList")}</Link>
        </Button>
      </section>
    );
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
