import { AppSidebar } from "@/components/app-sidebar";
import { PrivateNavbar } from "@/components/layout/private-navbar";

type PrivateShellProps = {
  children: React.ReactNode;
};

export function PrivateShell({ children }: PrivateShellProps) {
  return (
    <div className="flex min-h-full bg-background">
      <AppSidebar />
      <div className="flex min-h-full flex-1 flex-col">
        <PrivateNavbar />
        <main className="flex flex-1 flex-col p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
