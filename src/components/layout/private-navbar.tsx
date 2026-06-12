"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { RoleBadge } from "@/components/dashboard/role-badge";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRole } from "@/hooks/use-role";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export function PrivateNavbar() {
  const t = useTranslations("Private");
  const router = useRouter();
  const { user, role } = useRole();
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
    <header className="sticky top-0 z-20 border-b border-border/80 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <MobileSidebar />
          <p className="truncate text-sm font-semibold tracking-tight lg:hidden">
            {t("brand")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user && role ? (
            <div className="hidden items-center gap-2 md:flex">
              <p className="max-w-[12rem] truncate text-sm text-muted-foreground lg:max-w-xs">
                {user.email}
              </p>
              <RoleBadge role={role} />
              <Separator orientation="vertical" className="hidden h-5 lg:block" />
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md text-sm"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? t("loggingOut") : t("logout")}
          </Button>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
