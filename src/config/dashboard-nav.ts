import {
  LayoutDashboard,
  Mail,
  Megaphone,
  Search,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/types/auth";

export type DashboardNavItem = {
  href: string;
  labelKey:
    | "dashboard"
    | "campaigns"
    | "creators"
    | "brandDiscovery"
    | "emailAccounts"
    | "users"
    | "settings";
  icon: LucideIcon;
  roles: readonly UserRole[];
};

export const dashboardNavItems: DashboardNavItem[] = [
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
    href: "/dashboard/brand-discovery",
    labelKey: "brandDiscovery",
    icon: Search,
    roles: ["USER", "ADMIN"],
  },
  {
    href: "/dashboard/email-accounts",
    labelKey: "emailAccounts",
    icon: Mail,
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

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname.startsWith(href);
}
