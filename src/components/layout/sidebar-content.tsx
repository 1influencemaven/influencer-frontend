"use client";

import { useTranslations } from "next-intl";

import { RoleBadge } from "@/components/dashboard/role-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  dashboardNavItems,
  isNavItemActive,
} from "@/config/dashboard-nav";
import { useRole } from "@/hooks/use-role";
import { Link, usePathname } from "@/i18n/navigation";
import { canAccess } from "@/lib/auth/roles";
import { getEmailInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type SidebarContentProps = {
  onNavigate?: () => void;
  className?: string;
};

export function SidebarContent({ onNavigate, className }: SidebarContentProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const { user, role } = useRole();

  const visibleNavItems = dashboardNavItems.filter((item) =>
    canAccess(role, item.roles),
  );

  return (
    <div className={cn("flex h-full flex-col bg-card", className)}>
      <div className="border-b border-border/80 px-5 py-5">
        <p className="text-sm font-semibold tracking-tight">{t("brand")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("tagline")}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {visibleNavItems.map(({ href, labelKey, icon: Icon }) => {
          const isActive = isNavItemActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-accent/70 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {user && role ? (
        <>
          <Separator />
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="border border-border/80 bg-muted">
                <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                  {getEmailInitials(user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.email}</p>
                <RoleBadge role={role} className="mt-1" />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
