"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { TextFormField } from "@/components/forms/text-form-field";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import {
  getAuthErrorMessage,
  login,
  me,
} from "@/services/auth.service";
import {
  createLoginSchema,
  type LoginFormValues,
} from "@/schemas/login.schema";
import { useAuthStore } from "@/stores/auth.store";
import { isApiError } from "@/types/api-error";

export function LoginForm() {
  const t = useTranslations("Login");
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const [apiError, setApiError] = useState<string | null>(null);

  const loginSchema = useMemo(
    () =>
      createLoginSchema({
        emailRequired: t("errors.emailRequired"),
        emailInvalid: t("errors.emailInvalid"),
        passwordRequired: t("errors.passwordRequired"),
        passwordMin: t("errors.passwordMin"),
      }),
    [t],
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);
    setLoading(true);

    try {
      await login(values);
      const user = await me();
      setUser(user);
      router.push("/dashboard");
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        setApiError(t("errors.invalidCredentials"));
      } else {
        setApiError(getAuthErrorMessage(error) || t("errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FormErrorAlert message={apiError ?? ""} />

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
        autoComplete="current-password"
        disabled={isSubmitting}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-center text-xs text-muted-foreground">{t("helper")}</p>
    </form>
  );
}
