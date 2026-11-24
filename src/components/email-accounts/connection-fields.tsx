"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { providerLabel } from "@/components/email-accounts/email-account-badges";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyProviderPreset,
  mirrorSmtpCredentials,
  type ConnectionErrors,
} from "@/lib/email-account-providers";
import { cn } from "@/lib/utils";
import {
  EMAIL_PROVIDERS,
  MAIL_ENCRYPTIONS,
  type EmailAccountConnection,
  type EmailProvider,
  type MailEncryption,
  type MailServerSettings,
} from "@/types/email-accounts";

export const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

type ConnectionFieldsProps = {
  value: EmailAccountConnection;
  onChange: (next: EmailAccountConnection) => void;
  errors?: ConnectionErrors;
  sameCredentials: boolean;
  onSameCredentialsChange: (same: boolean) => void;
  /** Single connect: shows fromName and only allows SSL/TLS. */
  single?: boolean;
  disabled?: boolean;
};

function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function ConnectionFields({
  value,
  onChange,
  errors = {},
  sameCredentials,
  onSameCredentialsChange,
  single = false,
  disabled = false,
}: ConnectionFieldsProps) {
  const t = useTranslations("EmailAccounts");
  const uid = useId();
  const errorText = (path: string) => (errors[path] ? t(`validation.${errors[path]}`) : undefined);

  const update = (next: EmailAccountConnection) =>
    onChange(sameCredentials ? mirrorSmtpCredentials(next) : next);

  const setServer = (side: "smtp" | "imap", patch: Partial<MailServerSettings>) =>
    update({ ...value, [side]: { ...value[side], ...patch } });

  const encryptions = single ? MAIL_ENCRYPTIONS.filter((e) => e !== "none") : MAIL_ENCRYPTIONS;

  const serverFields = (side: "smtp" | "imap") => {
    const server = value[side];
    const credentialsLocked = side === "imap" && sameCredentials;
    return (
      <div className="grid gap-3 sm:grid-cols-6">
        <Field
          id={`${uid}-${side}-email`}
          label={t("fields.emailAddress")}
          error={errorText(`${side}.emailAddress`)}
          className="sm:col-span-3"
        >
          <Input
            id={`${uid}-${side}-email`}
            type="email"
            autoComplete="off"
            value={server.emailAddress}
            disabled={disabled || credentialsLocked}
            onChange={(event) => setServer(side, { emailAddress: event.target.value })}
          />
        </Field>
        <Field
          id={`${uid}-${side}-user`}
          label={t("fields.userName")}
          error={errorText(`${side}.userName`)}
          className="sm:col-span-3"
        >
          <Input
            id={`${uid}-${side}-user`}
            autoComplete="off"
            value={server.userName}
            disabled={disabled || credentialsLocked}
            onChange={(event) => setServer(side, { userName: event.target.value })}
          />
        </Field>
        <Field
          id={`${uid}-${side}-password`}
          label={t("fields.password")}
          error={errorText(`${side}.password`)}
          className="sm:col-span-6"
        >
          <Input
            id={`${uid}-${side}-password`}
            type="password"
            autoComplete="new-password"
            value={server.password}
            disabled={disabled || credentialsLocked}
            onChange={(event) => setServer(side, { password: event.target.value })}
          />
        </Field>
        <Field
          id={`${uid}-${side}-host`}
          label={t("fields.host")}
          error={errorText(`${side}.host`)}
          className="sm:col-span-3"
        >
          <Input
            id={`${uid}-${side}-host`}
            value={server.host}
            disabled={disabled}
            onChange={(event) => setServer(side, { host: event.target.value })}
          />
        </Field>
        <Field
          id={`${uid}-${side}-port`}
          label={t("fields.port")}
          error={errorText(`${side}.port`)}
          className="sm:col-span-1"
        >
          <Input
            id={`${uid}-${side}-port`}
            type="number"
            min={1}
            max={65535}
            value={Number.isFinite(server.port) ? server.port : ""}
            disabled={disabled}
            onChange={(event) => setServer(side, { port: Number(event.target.value) })}
          />
        </Field>
        <Field
          id={`${uid}-${side}-encryption`}
          label={t("fields.encryption")}
          error={errorText(`${side}.encryption`)}
          className="sm:col-span-2"
        >
          <select
            id={`${uid}-${side}-encryption`}
            className={selectClassName}
            value={server.encryption}
            disabled={disabled}
            onChange={(event) => setServer(side, { encryption: event.target.value as MailEncryption })}
          >
            {encryptions.map((encryption) => (
              <option key={encryption} value={encryption}>
                {t(`encryption.${encryption}`)}
              </option>
            ))}
          </select>
        </Field>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id={`${uid}-provider`} label={t("fields.provider")} className="sm:col-span-2">
          <select
            id={`${uid}-provider`}
            className={selectClassName}
            value={value.provider}
            disabled={disabled}
            onChange={(event) => update(applyProviderPreset(value, event.target.value as EmailProvider))}
          >
            {EMAIL_PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>
                {providerLabel(provider)}
              </option>
            ))}
          </select>
        </Field>
        <Field id={`${uid}-first`} label={t("fields.firstName")} error={errorText("fromFirstName")}>
          <Input
            id={`${uid}-first`}
            value={value.fromFirstName}
            disabled={disabled}
            onChange={(event) => update({ ...value, fromFirstName: event.target.value })}
          />
        </Field>
        <Field id={`${uid}-last`} label={t("fields.lastName")} error={errorText("fromLastName")}>
          <Input
            id={`${uid}-last`}
            value={value.fromLastName}
            disabled={disabled}
            onChange={(event) => update({ ...value, fromLastName: event.target.value })}
          />
        </Field>
        {single ? (
          <Field id={`${uid}-display`} label={t("fields.fromName")} className="sm:col-span-2">
            <Input
              id={`${uid}-display`}
              placeholder={`${value.fromFirstName} ${value.fromLastName}`.trim() || t("fields.fromNamePlaceholder")}
              value={value.fromName ?? ""}
              disabled={disabled}
              onChange={(event) => update({ ...value, fromName: event.target.value })}
            />
          </Field>
        ) : null}
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("fields.smtp")}
        </legend>
        {serverFields("smtp")}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 flex w-full items-center justify-between gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("fields.imap")}
        </legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-[var(--primary)]"
            checked={sameCredentials}
            disabled={disabled}
            onChange={(event) => {
              onSameCredentialsChange(event.target.checked);
              if (event.target.checked) onChange(mirrorSmtpCredentials(value));
            }}
          />
          {t("fields.sameCredentials")}
        </label>
        {serverFields("imap")}
      </fieldset>
    </div>
  );
}
