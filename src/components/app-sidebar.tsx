"use client";

import {
  LayoutDashboard,
  Megaphone,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useRole } from "@/hooks/use-role";
import { Link, usePathname } from "@/i18n/navigation";
import { canAccess } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

const navItems: Array<{
  href: string;
  labelKey: "dashboard" | "campaigns" | "creators" | "users" | "settings";
  icon: typeof LayoutDashboard;
  roles: readonly UserRole[];
}> = [
  {
    href: "/dashboard",
    labelKey: "dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "ADMIN"],
  },
  {
    href: "/dashboard/campaigns",
    labelKey: "campaigns",
    icon: Megaphone,
    roles: ["USER", "ADMIN"],
  },
  {
    href: "/dashboard/creators",
    labelKey: "creators",
    icon: Users,
    roles: ["USER", "ADMIN"],
  },
  {
    href: "/users",
    labelKey: "users",
    icon: Shield,
    roles: ["ADMIN"],
  },
  {
    href: "/dashboard/settings",
    labelKey: "settings",
    icon: Settings,
    roles: ["USER", "ADMIN"],
  },
];

export function AppSidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const { role } = useRole();

  const visibleNavItems = navItems.filter((item) => canAccess(role, item.roles));

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <p className="text-sm font-semibold tracking-tight">{t("brand")}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {visibleNavItems.map(({ href, labelKey, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
