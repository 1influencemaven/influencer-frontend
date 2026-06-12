import {
  LayoutDashboard,
  Megaphone,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/types/auth";

export type DashboardNavItem = {
  href: string;
  labelKey: "dashboard" | "campaigns" | "creators" | "users" | "settings";
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
