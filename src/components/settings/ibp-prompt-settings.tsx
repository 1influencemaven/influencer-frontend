"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { RoleGate } from "@/components/auth/role-gate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/hooks/use-role";
import {
  getIbpPrompt,
  resetIbpPrompt,
  updateIbpPrompt,
} from "@/services/ai-prompts.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { IbpPromptTemplate } from "@/types/ai-prompt";

const MAX_INSTRUCTIONS_LENGTH = 8000;

export function IbpPromptSettings() {
  const t = useTranslations("Settings.ibpPrompt");
  const { isAdmin } = useRole();
  const [template, setTemplate] = useState<IbpPromptTemplate | null>(null);
  const [instructions, setInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadTemplate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getIbpPrompt();
      setTemplate(data);
      setInstructions(data.instructions);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, t("errors.loadFailed")));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  const isDirty =
    template !== null && instructions.trim() !== template.instructions.trim();

  async function handleSave() {
    if (!isAdmin || isSaving) {
      return;
    }

    const trimmed = instructions.trim();
    if (!trimmed) {
      setError(t("errors.required"));
      return;
    }

    if (trimmed.length > MAX_INSTRUCTIONS_LENGTH) {
      setError(t("errors.tooLong"));
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await updateIbpPrompt({ instructions: trimmed });
      setTemplate(updated);
      setInstructions(updated.instructions);
      setSuccessMessage(t("saveSuccess"));
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, t("errors.saveFailed")));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!isAdmin || isResetting) {
      return;
    }

    setIsResetting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await resetIbpPrompt();
      setTemplate(updated);
      setInstructions(updated.instructions);
      setPendingReset(false);
      setSuccessMessage(t("resetSuccess"));
    } catch (resetError) {
      setError(getApiErrorMessage(resetError, t("errors.resetFailed")));
    } finally {
      setIsResetting(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="gap-0 border-border/80 py-0 shadow-sm">
        <CardHeader className="gap-1 py-5">
          <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
          <CardDescription>{t("loading")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="gap-0 border-border/80 py-0 shadow-sm">
      <CardHeader className="gap-1 py-5">
        <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pb-5">
        <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {t("hint")}
        </p>

        <div className="space-y-2">
          <Label htmlFor="ibp-prompt-instructions">{t("instructionsLabel")}</Label>
          <Textarea
            id="ibp-prompt-instructions"
            rows={16}
            className="min-h-64 font-mono text-sm"
            value={instructions}
            readOnly={!isAdmin}
            disabled={!isAdmin || isSaving || isResetting}
            onChange={(event) => {
              setInstructions(event.target.value);
              setSuccessMessage(null);
              setError(null);
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {t("characterCount", {
                current: instructions.length,
                max: MAX_INSTRUCTIONS_LENGTH,
              })}
            </span>
            {template?.isDefault ? (
              <span>{t("usingDefault")}</span>
            ) : (
              <span>{t("customized")}</span>
            )}
          </div>
        </div>

        {!isAdmin ? (
          <p className="text-sm text-muted-foreground">{t("readOnlyHint")}</p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {successMessage ? (
          <p className="text-sm text-primary" role="status">
            {successMessage}
          </p>
        ) : null}

        <RoleGate roles={["ADMIN"]}>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={!isDirty || isSaving || isResetting}
              onClick={() => void handleSave()}
            >
              {isSaving ? t("saving") : t("save")}
            </Button>

            {pendingReset ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("resetConfirm")}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isResetting}
                  onClick={() => setPendingReset(false)}
                >
                  {t("resetCancel")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isResetting}
                  onClick={() => void handleReset()}
                >
                  {isResetting ? t("resetting") : t("resetConfirmAction")}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving || isResetting || template?.isDefault}
                onClick={() => setPendingReset(true)}
              >
                {t("reset")}
              </Button>
            )}
          </div>
        </RoleGate>
      </CardContent>
    </Card>
  );
}
