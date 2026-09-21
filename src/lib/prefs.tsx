"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { LOCALES, messages, type Locale, type Messages } from "./messages";

export type Theme = "light" | "dark";

const LANG_KEY = "unscene-lang";
const THEME_KEY = "unscene-theme";

function makeStore(read: () => string) {
  const listeners = new Set<() => void>();
  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    emit: () => listeners.forEach((l) => l()),
    read,
  };
}

const safeGet = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const safeSet = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

const langStore = makeStore(() => {
  const v = safeGet(LANG_KEY);
  return LOCALES.includes(v as Locale) ? (v as string) : "en";
});

// The pre-paint script in <head> sets data-theme; the store just mirrors it.
const themeStore = makeStore(() =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light",
);

export function useLocale() {
  const locale = useSyncExternalStore(langStore.subscribe, langStore.read, () => "en") as Locale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    safeSet(LANG_KEY, next);
    langStore.emit();
  }, []);

  return { locale, setLocale, t: messages[locale] as Messages };
}

export function useTheme() {
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.read, () => "light") as Theme;

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    applyTheme(next);
    safeSet(THEME_KEY, next);
    themeStore.emit();
    setTimeout(() => root.classList.remove("theme-anim"), 300);
  }, []);

  return { theme, setTheme };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

// Runs before first paint (inlined in <head>) so there's no flash. First visit is always light;
// only an explicit choice of dark is remembered.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}')==='dark'?'dark':'light';var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t}catch(e){}})()`;
