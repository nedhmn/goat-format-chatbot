import { useSyncExternalStore } from "react";

export const themes = ["system", "light", "dark"] as const;

export type Theme = (typeof themes)[number];

const STORAGE_KEY = "theme";
const THEME_CHANGE = "themechange";
const darkScheme = matchMedia("(prefers-color-scheme: dark)");

export function parseTheme(value: string | null): Theme {
  return value === "light" || value === "dark" ? value : "system";
}

function readTheme(): Theme {
  try {
    return parseTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return "system";
  }
}

function saveTheme(theme: Theme): void {
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    return;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGE, onChange);
  };
}

export function setTheme(theme: Theme): void {
  saveTheme(theme);
  const dark = theme === "dark" || (theme === "system" && darkScheme.matches);
  document.documentElement.classList.toggle("dark", dark);
  window.dispatchEvent(new Event(THEME_CHANGE));
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme);
}
