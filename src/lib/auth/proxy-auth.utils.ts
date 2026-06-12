export const PROTECTED_PATHS = ["/dashboard", "/users", "/campaigns"] as const;

export const AUTH_PATHS = ["/login"] as const;

type LocaleConfig = {
  locales: readonly string[];
  defaultLocale: string;
};

export function getPathnameWithoutLocale(
  pathname: string,
  { locales, defaultLocale }: LocaleConfig,
): {
  locale: string | null;
  pathname: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && locales.includes(firstSegment)) {
    const rest = segments.slice(1);
    return {
      locale: firstSegment,
      pathname: rest.length > 0 ? `/${rest.join("/")}` : "/",
    };
  }

  return {
    locale: null,
    pathname,
  };
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (protectedPath) =>
      pathname === protectedPath || pathname.startsWith(`${protectedPath}/`),
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (authPath) => pathname === authPath || pathname.startsWith(`${authPath}/`),
  );
}

export function buildLocalizedPath(
  origin: string,
  locale: string | null,
  defaultLocale: string,
  path: string,
): URL {
  const activeLocale = locale ?? defaultLocale;
  return new URL(`/${activeLocale}${path}`, origin);
}

export function resolveAuthRedirect(
  pathname: string,
  sessionActive: boolean,
  localeConfig: LocaleConfig,
  origin: string,
): URL | null {
  const { locale, pathname: normalizedPath } = getPathnameWithoutLocale(
    pathname,
    localeConfig,
  );

  if (isProtectedPath(normalizedPath) && !sessionActive) {
    return buildLocalizedPath(origin, locale, localeConfig.defaultLocale, "/login");
  }

  if (isAuthPath(normalizedPath) && sessionActive) {
    return buildLocalizedPath(
      origin,
      locale,
      localeConfig.defaultLocale,
      "/dashboard",
    );
  }

  return null;
}
