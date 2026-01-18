import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "careerroad-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      return stored ?? defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved: "light" | "dark" = theme === "system" ? (systemDark ? "dark" : "light") : theme;

    root.classList.remove("light", "dark");
    root.classList.add(resolved);

    try {
      localStorage.setItem(storageKey, theme);
    } catch {}
  }, [theme, storageKey]);

  // Keep in sync with system preference when set to system
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme: setThemeState }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
