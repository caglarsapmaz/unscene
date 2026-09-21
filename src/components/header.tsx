"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useLocale, useTheme } from "@/lib/prefs";
import { scrollToTop } from "@/lib/scroll";
import { LOCALES } from "@/lib/messages";
import { GithubIcon, LogoMark } from "./icons";

export const GITHUB_URL = "https://github.com/caglarsapmaz";
export const LINKEDIN_URL = "https://linkedin.com/in/caglarsapmaz";

export function SkipLink() {
  const { t } = useLocale();
  return (
    <a
      href="#tool"
      className="sr-only z-50 rounded-lg bg-cta px-4 py-2.5 text-sm font-medium text-on-cta focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {t.skip}
    </a>
  );
}

export function Header() {
  const { locale, setLocale, t } = useLocale();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-line-strong/40">
      <div className="mx-auto flex h-[4.5rem] max-w-[1200px] items-center justify-between gap-2 px-3 xs:px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={(e) => {
            // Same page: scroll to the real top. (The old #top anchor sat below the header, so the page slid down.)
            e.preventDefault();
            scrollToTop();
          }}
          className="flex items-center gap-2 no-underline xs:gap-2.5"
          aria-label={`${t.name}, home`}
        >
          <LogoMark size={28} />
          <span className="text-[1.375rem] font-medium leading-none tracking-tight">{t.brand}</span>
        </Link>

        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.header.githubLabel}
            className="inline-flex h-[var(--ctl)] min-w-[var(--ctl)] items-center justify-center gap-2 rounded-[10px] text-[0.9375rem] font-medium no-underline hover:bg-tint sm:px-3"
          >
            <GithubIcon width={20} height={20} />
            <span lang="en" className="hidden sm:inline">
              {t.header.github}
            </span>
          </a>

          <div className="flex items-center gap-1.5 text-[0.9375rem]" role="group" aria-label={t.header.language}>
            {LOCALES.map((l, i) => (
              <Fragment key={l}>
                {i > 0 && (
                  <span aria-hidden className="text-muted">
                    /
                  </span>
                )}
                <button type="button" className="lang-link" aria-pressed={locale === l} lang={l} onClick={() => setLocale(l)}>
                  {l.toUpperCase()}
                </button>
              </Fragment>
            ))}
          </div>

          <div className="flex items-center" role="group" aria-label={t.header.theme}>
            <button type="button" className="theme-btn" aria-pressed={theme === "light"} aria-label={t.header.light} onClick={() => setTheme("light")}>
              <Sun size={18} strokeWidth={1.75} aria-hidden />
            </button>
            <button type="button" className="theme-btn" aria-pressed={theme === "dark"} aria-label={t.header.dark} onClick={() => setTheme("dark")}>
              <Moon size={18} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
