"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useLocale } from "@/lib/prefs";
import { scrollToTop } from "@/lib/scroll";

const SHOW_AFTER = 0.8; // fraction of a viewport height to scroll before the button starts to appear
const FULL_BEFORE_END = 160; // px from the end of the page where it reaches 100%
const MIN_INTERACTIVE = 0.04; // below this the button is invisible, so it should not take clicks or focus

export function BackToTop() {
  const { t } = useLocale();
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Opacity follows scroll progress: 0% at the start line, 100% near the end of the page.
    // It is written straight to a CSS variable, so scrolling never triggers a React render.
    const update = () => {
      const el = button.current;
      if (!el) return;
      const start = window.innerHeight * SHOW_AFTER;
      const end = Math.max(
        start + 200, // keeps the ramp sane on pages that barely scroll
        document.documentElement.scrollHeight - window.innerHeight - FULL_BEFORE_END,
      );
      const p = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
      el.style.setProperty("--p", p.toFixed(3));
      el.inert = p < MIN_INTERACTIVE;
    };
    const first = setTimeout(update, 0); // covers a page that loads already scrolled (reload, back button)
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(first);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <button
      ref={button}
      type="button"
      onClick={scrollToTop}
      aria-label={t.backToTop}
      title={t.backToTop}
      inert
      style={{ ["--p" as string]: 0 }}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 grid size-12 place-items-center rounded-full bg-cta text-on-cta opacity-[var(--p)] shadow-[var(--shadow)] transition-[opacity,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:opacity-100 focus-visible:opacity-100 active:translate-y-px sm:right-6 md:bottom-24"
    >
      <ArrowUp size={22} strokeWidth={2} aria-hidden />
    </button>
  );
}
