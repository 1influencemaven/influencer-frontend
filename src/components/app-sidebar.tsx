"use client";

import { LayoutDashboard, Megaphone, Settings, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/campaigns", labelKey: "campaigns", icon: Megaphone },
  { href: "/dashboard/creators", labelKey: "creators", icon: Users },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings },
] as const;

export function AppSidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <p className="text-sm font-semibold tracking-tight">{t("brand")}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
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
