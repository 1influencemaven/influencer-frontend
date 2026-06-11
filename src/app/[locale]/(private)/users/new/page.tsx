import { getTranslations, setRequestLocale } from "next-intl/server";

import { RequireRole } from "@/components/auth/require-role";
import { CreateUserForm } from "@/components/users/create-user-form";
import { routing, type AppLocale } from "@/i18n/routing";

type NewUserPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function NewUserPage({ params }: NewUserPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("CreateUser");

  return (
    <RequireRole roles={["ADMIN"]}>
      <div className="flex flex-col gap-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <CreateUserForm />
      </div>
    </RequireRole>
  );
}
