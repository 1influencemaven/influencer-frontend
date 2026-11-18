import isoCountryCodes from "@/lib/iso-country-codes.generated.json";

export type CountryOption = {
  /** ISO 3166-1 alpha-2 (persisted on Influencer.country). */
  code: string;
  /** Localized display name for the current UI locale. */
  label: string;
};

const ISO_COUNTRY_CODE_SET = new Set(
  (isoCountryCodes as string[]).map((code) => code.toUpperCase()),
);

export function isIsoCountryCode(value: string): boolean {
  const code = value.trim().toUpperCase();
  return code.length === 2 && ISO_COUNTRY_CODE_SET.has(code);
}

export function getCountryOptions(locale: string): CountryOption[] {
  const displayLocale = locale.startsWith("es") ? "es" : "en";
  const displayNames = new Intl.DisplayNames([displayLocale], {
    type: "region",
  });

  return (isoCountryCodes as string[])
    .map((code) => {
      const normalized = code.toUpperCase();
      return {
        code: normalized,
        label: displayNames.of(normalized) ?? normalized,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, displayLocale));
}

export function getCountryLabel(
  code: string | null | undefined,
  locale: string,
): string | null {
  if (!code?.trim()) return null;
  const normalized = code.trim().toUpperCase();
  if (!isIsoCountryCode(normalized)) return normalized;
  const displayLocale = locale.startsWith("es") ? "es" : "en";
  return (
    new Intl.DisplayNames([displayLocale], { type: "region" }).of(
      normalized,
    ) ?? normalized
  );
}
