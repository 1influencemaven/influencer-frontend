"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const t = useTranslations("Login");

  return (
    <form
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="space-y-2">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        {t("submit")}
      </Button>
      <p className="text-center text-xs text-muted-foreground">{t("helper")}</p>
    </form>
  );
}
