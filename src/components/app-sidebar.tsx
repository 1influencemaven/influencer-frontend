import { SidebarContent } from "@/components/layout/sidebar-content";

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/80 bg-card lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  );
}
