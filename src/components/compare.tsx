"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  original: string;
  result: string;
  width: number;
  height: number;
  labels: { original: string; transparent: string; compare: string; altOriginal: string; altResult: string };
};

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/** Before/after slider. Left of the handle shows the original, right shows the unscene on a checkerboard. */
export function Compare({ original, result, width, height, labels }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState(100); // % of the original that is visible
  const [settled, setSettled] = useState(false);

  // Intro: wipe from "all original" to the middle so the removal is visible.
  // (Reduced-motion users get the same end state; the global CSS rule collapses the transition.)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setPos(50));
    const done = setTimeout(() => setSettled(true), 900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, []);

  const move = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPos(clamp(((clientX - r.left) / r.width) * 100));
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const next =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? pos - step
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? pos + step
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? 100
              : null;
    if (next === null) return;
    e.preventDefault();
    setSettled(true);
    setPos(clamp(next));
  };

  const ratio = width / height;
  const animate = !settled;

  return (
    <div
      ref={box}
      className="checker relative mx-auto max-w-full touch-pan-y select-none overflow-hidden rounded-2xl border border-line"
      style={{ aspectRatio: `${width} / ${height}`, width: `min(100%, calc(72svh * ${ratio}))` }}
      onPointerDown={(e) => {
        dragging.current = true;
        setSettled(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={result} alt={labels.altResult} className="absolute inset-0 h-full w-full object-contain" draggable={false} />

      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - pos}% 0 0)`,
          transition: animate ? "clip-path 800ms cubic-bezier(0.2, 0.7, 0.2, 1)" : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={original} alt={labels.altOriginal} className="h-full w-full bg-sunken object-contain" draggable={false} />
      </div>

      <span className="chip pointer-events-none absolute left-3 top-3 bg-surface shadow-sm">
        {labels.original}
      </span>
      <span className="chip pointer-events-none absolute right-3 top-3 bg-surface shadow-sm">
        {labels.transparent}
      </span>

      <div
        className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(11_61_145/0.25)]"
        style={{
          left: `${pos}%`,
          transition: animate ? "left 800ms cubic-bezier(0.2, 0.7, 0.2, 1)" : undefined,
        }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label={labels.compare}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% ${labels.original}`}
          onKeyDown={onKey}
          className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none place-items-center rounded-full border-[3px] border-white bg-secondary text-white shadow-[0_2px_10px_rgb(11_61_145/0.4)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
