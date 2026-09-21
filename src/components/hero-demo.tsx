"use client";

import { useState } from "react";
import { useLocale } from "@/lib/prefs";
import { SoftBlob } from "./soft-blob";

// Flat illustration in the brand palette: a potted cactus (subject) on a sky scene (background).
function Scene({ background }: { background: boolean }) {
  return (
    <svg viewBox="0 0 300 400" className="block h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      {background && (
        <g>
          <rect width="300" height="400" fill="#3ba7f2" />
          <circle cx="232" cy="84" r="34" fill="#e8f6ff" />
          <g fill="#ffffff">
            <rect x="34" y="92" width="92" height="26" rx="13" />
            <rect x="58" y="74" width="52" height="30" rx="15" />
          </g>
          <path d="M0 300 C60 262 120 270 170 292 C220 312 262 296 300 268 V400 H0 Z" fill="#7fe7d6" opacity="0.55" />
          <rect y="352" width="300" height="48" fill="#e8f6ff" />
        </g>
      )}
      <g>
        <rect x="120" y="140" width="64" height="196" rx="32" fill="#7fe7d6" />
        <rect x="150" y="140" width="10" height="196" rx="5" fill="#4fcdb9" opacity="0.7" />
        <rect x="80" y="206" width="36" height="84" rx="18" fill="#7fe7d6" />
        <rect x="96" y="262" width="44" height="28" rx="14" fill="#7fe7d6" />
        <rect x="184" y="178" width="36" height="88" rx="18" fill="#7fe7d6" />
        <rect x="164" y="232" width="44" height="28" rx="14" fill="#7fe7d6" />
        <g fill="#0b3d91">
          <circle cx="140" cy="190" r="3" />
          <circle cx="164" cy="230" r="3" />
          <circle cx="138" cy="270" r="3" />
          <circle cx="98" cy="240" r="3" />
          <circle cx="202" cy="214" r="3" />
        </g>
        <circle cx="152" cy="132" r="13" fill="#ffffff" />
        <circle cx="152" cy="132" r="5" fill="#3ba7f2" />
        <path d="M108 326 H196 L184 384 H120 Z" fill="#0b3d91" />
        <rect x="100" y="314" width="104" height="20" rx="8" fill="#0b3d91" />
      </g>
    </svg>
  );
}

export function HeroDemo() {
  const { t } = useLocale();
  const [v, setV] = useState(0); // 0 = original, 100 = fully removed

  return (
    <div className="relative mx-auto h-[34rem] w-full max-w-[36rem]">
      {/* soft organic shapes + doodles */}
      <SoftBlob className="absolute -right-10 bottom-10 w-40 text-secondary/45" rx={82} ry={78} seed={19} delay="-4s" />
      <svg className="pointer-events-none absolute top-24 left-0 h-9 w-9 text-secondary" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden focusable="false">
        <path d="M6 8c4 6 6 14 5 22M15 6c4 6 5 14 3 24M25 9c1 6 0 14-2 20" />
      </svg>
      <svg className="pointer-events-none absolute top-40 right-0 h-10 w-12 text-ink" viewBox="0 0 48 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden focusable="false">
        <path d="M6 30 42 10M12 36 44 20" />
      </svg>

      <div aria-hidden className="float absolute top-16 left-0 w-[15.5rem]" style={{ ["--r" as string]: "-4deg", rotate: "-4deg" }}>
        <div className="rounded-[1.4rem] bg-white p-2 shadow-[var(--shadow)]">
          <div className="checker relative aspect-[3/4] overflow-hidden rounded-[1rem]">
            <Scene background={false} />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${v}%)` }}>
              <Scene background />
            </div>
          </div>
        </div>
        <span className="chip absolute top-5 -left-3 -rotate-6 bg-white text-primary shadow-sm">{t.demo.original}</span>
      </div>

      <div aria-hidden className="absolute top-2 right-0 w-[15.5rem]" style={{ rotate: "3deg" }}>
        <div className="rounded-[1.4rem] bg-white p-2 shadow-[var(--shadow)]">
          <div className="checker aspect-[3/4] overflow-hidden rounded-[1rem]">
            <Scene background={false} />
          </div>
        </div>
        <span className="chip absolute top-5 left-4 rotate-3 bg-white text-primary shadow-sm">{t.demo.transparent}</span>
      </div>

      <svg aria-hidden className="pointer-events-none absolute top-[7.5rem] left-[47%] h-16 w-24 text-ink" viewBox="0 0 96 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <path d="M6 30C24 8 58 8 84 34" />
        <path d="m70 34 15 2-2-15" />
      </svg>

      <div className="absolute bottom-0 left-1/2 flex w-[min(21rem,100%)] -translate-x-1/2 items-center gap-3 rounded-full bg-surface px-5 py-2.5 text-sm shadow-[var(--shadow)]">
        <span className="shrink-0">{t.demo.original}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
          aria-label={t.demo.slider}
          className="range"
          style={{ ["--v" as string]: `${v}%` }}
        />
        <span className="shrink-0">{t.demo.result}</span>
      </div>
    </div>
  );
}
