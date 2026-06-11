import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-end gap-2 border-b border-border px-6 py-4">
      <LocaleSwitcher />
      <ThemeToggle />
    </header>
  );
}
