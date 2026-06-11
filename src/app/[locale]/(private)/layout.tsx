import { RequireAuth } from "@/components/auth/require-auth";
import { PrivateShell } from "@/components/layout/private-shell";

type PrivateLayoutProps = {
  children: React.ReactNode;
};

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <RequireAuth>
      <PrivateShell>{children}</PrivateShell>
    </RequireAuth>
  );
}
