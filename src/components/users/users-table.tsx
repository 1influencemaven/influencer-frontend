"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { RoleBadge } from "@/components/dashboard/role-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { deleteUser, listUsers } from "@/services/users.service";
import { getApiErrorMessage, isApiError } from "@/types/api-error";
import type { User } from "@/types/user";

function formatCreatedAt(value: string | undefined, locale: string): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UsersTable() {
  const t = useTranslations("Users");
  const locale = useLocale();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listUsers();
      setUsers(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, t("loadError")));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleDelete(userId: string) {
    setDeletingId(userId);
    setError(null);

    try {
      await deleteUser(userId);
      setUsers((current) => current.filter((user) => user.id !== userId));
      setPendingDeleteId(null);
    } catch (deleteError) {
      if (isApiError(deleteError) && deleteError.status === 403) {
        setError(t("deleteForbidden"));
      } else {
        setError(getApiErrorMessage(deleteError, t("deleteError")));
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </section>
    );
  }

  if (error && users.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-destructive">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => void loadUsers()}>
          {t("retry")}
        </Button>
      </section>
    );
  }

  if (users.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-muted/40 p-6">
        <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-muted/40">
              <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("columns.name")}
              </TableHead>
              <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("columns.email")}
              </TableHead>
              <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("columns.role")}
              </TableHead>
              <TableHead className="px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("columns.createdAt")}
              </TableHead>
              <TableHead className="px-4 text-right text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isPendingDelete = pendingDeleteId === user.id;
              const isDeleting = deletingId === user.id;
              const isCurrentUser = user.id === currentUserId;

              return (
                <TableRow key={user.id}>
                  <TableCell className="px-4 text-sm">{user.name}</TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4">
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground">
                    {formatCreatedAt(user.createdAt, locale)}
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    {isPendingDelete ? (
                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                        <span className="text-xs text-muted-foreground">
                          {t("deleteConfirm")}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => setPendingDeleteId(null)}
                          >
                            {t("deleteCancel")}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => void handleDelete(user.id)}
                          >
                            {isDeleting ? t("deleting") : t("deleteConfirmAction")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/users/${user.id}/edit`}>{t("editAction")}</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={isCurrentUser}
                          onClick={() => setPendingDeleteId(user.id)}
                        >
                          {t("deleteAction")}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
