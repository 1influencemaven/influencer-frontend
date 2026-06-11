const THEME_INIT_SCRIPT = `
(function () {
  try {
    var root = document.documentElement;
    var classList = root.classList;
    classList.remove("light", "dark");
    var stored = localStorage.getItem("theme");
    var theme = stored || "system";

    if (theme === "system") {
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var resolved = prefersDark ? "dark" : "light";
      root.style.colorScheme = resolved;
      classList.add(resolved);
      return;
    }

    classList.add(theme);
    if (theme === "light" || theme === "dark") {
      root.style.colorScheme = theme;
    }
  } catch (error) {
    // Ignore storage access errors.
  }
})();
`.trim();

export function ThemeInitScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
