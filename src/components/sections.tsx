"use client";

import { ArrowRight, CloudUpload, Download, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/prefs";

const wrap = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";

// Step chips use tints of the palette: blue, mint, then a deeper blue.
const STEP_TONES = ["bg-tint", "bg-[var(--tint-mint)]", "bg-[color-mix(in_srgb,var(--secondary)_34%,var(--bg))]"];
const STEP_ICONS = [CloudUpload, Sparkles, Download];

export function How() {
  const { t } = useLocale();
  return (
    <section aria-labelledby="how-h" className="border-t border-line-strong/40">
      <div className={`${wrap} grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)] lg:gap-12`}>
        <div>
          <p className="label text-muted">{t.how.label}</p>
          <h2 id="how-h" className="display mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)]" style={{ lineHeight: 1.1 }}>
            {t.how.title}
          </h2>
        </div>

        <ol className="grid gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start md:gap-4">
          {t.how.steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <li key={s.n} className="contents">
                <div className="on-scroll flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-11 min-w-11 place-items-center rounded-xl px-3 text-[0.9375rem] font-medium ${STEP_TONES[i]} text-ink`}>{s.n}</span>
                    <Icon size={26} strokeWidth={1.5} className="text-ink" aria-hidden />
                  </div>
                  <h3 className="display mt-1 text-2xl" style={{ lineHeight: 1.15 }}>
                    {s.t}
                  </h3>
                  <p className="max-w-[16rem] text-[0.9375rem] text-muted">{s.d}</p>
                </div>
                {i < t.how.steps.length - 1 && (
                  <ArrowRight size={22} strokeWidth={1.5} className="mt-3 hidden text-muted md:block" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function Privacy() {
  const { t } = useLocale();
  return (
    <section id="privacy" aria-labelledby="privacy-h" className="border-t border-line-strong/40">
      <div className={`${wrap} grid gap-8 py-14 sm:py-20 md:grid-cols-12 md:gap-10`}>
        <div className="md:col-span-4">
          <span className="chip">{t.privacy.label}</span>
          <h2 id="privacy-h" className="display mt-4 text-[clamp(1.75rem,3.4vw,2.5rem)]" style={{ lineHeight: 1.1 }}>
            {t.privacy.title}
          </h2>
        </div>
        <dl className="md:col-span-8">
          {t.privacy.items.map((it, i) => (
            <div key={it.q} className={`on-scroll grid gap-1.5 border-b border-line-strong/40 py-5 sm:grid-cols-[1fr_1.6fr] sm:gap-8 ${i === 0 ? "border-t" : ""}`}>
              <dt className="font-medium">{it.q}</dt>
              <dd className="text-muted">{it.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
