"use client";

import { Heart } from "lucide-react";
import { useLocale } from "@/lib/prefs";
import { GithubIcon, LinkedinIcon } from "./icons";
import { GITHUB_URL, LINKEDIN_URL } from "./header";

export function Footer() {
  const { t } = useLocale();
  const f = t.footer;

  return (
    <footer className="border-t border-line-strong/40">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">{f.tagline}</p>
          <p className="heart-host flex items-center gap-2 text-sm text-muted">
            <span>{f.credit}</span>
            <Heart className="heart" size={15} strokeWidth={1.75} aria-label={f.love} role="img" />
          </p>
        </div>

        <div className="flex gap-2.5">
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label={f.linkedinLabel} className="icon-btn size-11 border-[1.5px] border-ink text-ink">
            <LinkedinIcon />
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label={f.githubLabel} className="icon-btn size-11 border-[1.5px] border-ink text-ink">
            <GithubIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
