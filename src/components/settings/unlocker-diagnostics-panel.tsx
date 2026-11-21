"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { RoleGate } from "@/components/auth/role-gate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRole } from "@/hooks/use-role";
import { probeUnlockerDiagnostic } from "@/services/lead-discovery.service";
import { getApiErrorMessage } from "@/types/api-error";
import {
  UNLOCKER_DIAGNOSTIC_ALLOWED_URL,
  type UnlockerDiagnosticResult,
} from "@/types/lead-discovery";

export function UnlockerDiagnosticsPanel() {
  const t = useTranslations("Settings.unlockerDiagnostics");
  const { isAdmin } = useRole();
  const [isProbing, setIsProbing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UnlockerDiagnosticResult | null>(null);

  async function handleProbe() {
    if (!isAdmin || isProbing) {
      return;
    }

    setIsProbing(true);
    setError(null);
    setResult(null);

    try {
      const data = await probeUnlockerDiagnostic(
        UNLOCKER_DIAGNOSTIC_ALLOWED_URL,
      );
      setResult(data);
    } catch (probeError) {
      setError(getApiErrorMessage(probeError, t("errors.probeFailed")));
    } finally {
      setIsProbing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("hint")}</p>

        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("urlLabel")}
          </p>
          <p className="font-mono text-sm break-all">
            {UNLOCKER_DIAGNOSTIC_ALLOWED_URL}
          </p>
        </div>

        {!isAdmin ? (
          <p className="text-sm text-muted-foreground">{t("adminOnlyHint")}</p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {result ? (
          <dl
            className="grid gap-2 rounded-md border border-border p-3 text-sm"
            data-testid="unlocker-diagnostic-result"
          >
            <div className="grid grid-cols-[10rem_1fr] gap-2">
              <dt className="text-muted-foreground">{t("fields.outcome")}</dt>
              <dd className="font-mono">{result.outcome}</dd>
            </div>
            <div className="grid grid-cols-[10rem_1fr] gap-2">
              <dt className="text-muted-foreground">
                {t("fields.apiHttpStatus")}
              </dt>
              <dd className="font-mono">{result.apiHttpStatus}</dd>
            </div>
            <div className="grid grid-cols-[10rem_1fr] gap-2">
              <dt className="text-muted-foreground">
                {t("fields.bodyLength")}
              </dt>
              <dd className="font-mono">{result.bodyLength}</dd>
            </div>
            <div className="grid grid-cols-[10rem_1fr] gap-2">
              <dt className="text-muted-foreground">{t("fields.elapsedMs")}</dt>
              <dd className="font-mono">{result.elapsedMs}</dd>
            </div>
            <div className="grid grid-cols-[10rem_1fr] gap-2">
              <dt className="text-muted-foreground">{t("fields.zone")}</dt>
              <dd className="font-mono">{result.zone}</dd>
            </div>
            {result.errorName ? (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-muted-foreground">
                  {t("fields.errorName")}
                </dt>
                <dd className="font-mono">{result.errorName}</dd>
              </div>
            ) : null}
            {result.errorMessage ? (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-muted-foreground">
                  {t("fields.errorMessage")}
                </dt>
                <dd className="font-mono break-all">{result.errorMessage}</dd>
              </div>
            ) : null}
            {result.causeName ? (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-muted-foreground">
                  {t("fields.causeName")}
                </dt>
                <dd className="font-mono">{result.causeName}</dd>
              </div>
            ) : null}
            {result.causeCode ? (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-muted-foreground">
                  {t("fields.causeCode")}
                </dt>
                <dd className="font-mono">{result.causeCode}</dd>
              </div>
            ) : null}
            {result.causeSyscall ? (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-muted-foreground">
                  {t("fields.causeSyscall")}
                </dt>
                <dd className="font-mono">{result.causeSyscall}</dd>
              </div>
            ) : null}
            {result.causeHostname ? (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-muted-foreground">
                  {t("fields.causeHostname")}
                </dt>
                <dd className="font-mono">{result.causeHostname}</dd>
              </div>
            ) : null}
            {result.causePort !== undefined ? (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-muted-foreground">
                  {t("fields.causePort")}
                </dt>
                <dd className="font-mono">{result.causePort}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <RoleGate roles={["ADMIN"]}>
          <Button
            type="button"
            disabled={isProbing}
            onClick={() => void handleProbe()}
          >
            {isProbing ? t("probing") : t("probe")}
          </Button>
        </RoleGate>
      </CardContent>
    </Card>
  );
}
