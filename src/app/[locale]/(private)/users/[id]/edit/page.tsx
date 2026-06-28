import { getTranslations, setRequestLocale } from "next-intl/server";

import { RequireRole } from "@/components/auth/require-role";
import { EditUserForm } from "@/components/users/edit-user-form";
import { type AppLocale } from "@/i18n/routing";

type EditUserPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("EditUser");

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
        <EditUserForm userId={id} />
      </div>
    </RequireRole>
  );
}
