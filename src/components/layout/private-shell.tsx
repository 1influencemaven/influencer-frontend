import { AppSidebar } from "@/components/app-sidebar";
import { PrivateNavbar } from "@/components/layout/private-navbar";

type PrivateShellProps = {
  children: React.ReactNode;
};

export function PrivateShell({ children }: PrivateShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <PrivateNavbar />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
