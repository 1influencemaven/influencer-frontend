import { getTranslations, setRequestLocale } from "next-intl/server";

import { RequireRole } from "@/components/auth/require-role";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/users/users-table";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

type UsersPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Users");

  return (
    <RequireRole roles={["ADMIN"]}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <Button asChild>
            <Link href="/users/new">{t("createAction")}</Link>
          </Button>
        </div>
        <UsersTable />
      </div>
    </RequireRole>
  );
}
