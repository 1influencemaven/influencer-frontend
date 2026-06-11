"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export function PrivateNavbar() {
  const t = useTranslations("Private");
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // Backend clears cookies when possible; always reset client session.
    } finally {
      clearUser();
      setIsLoggingOut(false);
      router.replace("/login");
    }
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-4">
      <p className="text-sm font-medium text-foreground">{t("brand")}</p>
      <div className="flex items-center gap-3">
        {user ? (
          <p className="hidden text-sm text-muted-foreground sm:block">
            {user.email}
          </p>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? t("loggingOut") : t("logout")}
        </Button>
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
