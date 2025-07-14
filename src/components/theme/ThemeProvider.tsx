// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const themeOptions = {
  dark: "dark",
  light: "light",
  system: "system"
} as const;

type Theme = typeof themeOptions[keyof typeof themeOptions];

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [storageKey]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
