"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  /** Half-width and half-height of the resting shape, in viewBox units. */
  rx: number;
  ry: number;
  seed?: number;
  /** Negative delay so two blobs never drift in sync. */
  delay?: string;
};

const N = 14; // points around the outline
const PAD = 30; // room in the viewBox for dents, wobble and overshoot

// Motion tuning: firm dent, soft spring (damping ratio ~0.5, so a small overshoot).
const IDLE = 0.05; // breathing amplitude, fraction of radius
const DEPTH = 0.5; // how far the outline is pushed in at the cursor, fraction of radius
const K = 0.08; // spring stiffness per frame
const C = 0.27; // damping per frame
const MIN_S = 0.42;
const MAX_S = 1.2;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Per-point resting irregularity plus breathing speed and phase, all deterministic from the seed.
function makeShape(seed: number) {
  const r = rng(seed);
  return Array.from({ length: N }, () => ({
    irr: 1 + (r() - 0.5) * 0.16,
    w: 0.0004 + r() * 0.0006, // rad per ms, roughly 6 to 15 s per breath
    ph: r() * Math.PI * 2,
  }));
}

const f = (n: number) => n.toFixed(1);

// Closed Catmull-Rom spline converted to cubic Beziers, so the outline stays smooth however it deforms.
function toPath(p: number[][]) {
  const n = p.length;
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

const angle = (i: number) => (i / N) * Math.PI * 2 - Math.PI / 2;

function points(rx: number, ry: number, cx: number, cy: number, shape: ReturnType<typeof makeShape>, d: number[], ox: number, oy: number) {
  return shape.map((s, i) => [
    cx + ox + rx * Math.cos(angle(i)) * s.irr * (1 + d[i]),
    cy + oy + ry * Math.sin(angle(i)) * s.irr * (1 + d[i]),
  ]);
}

export function SoftBlob({ className = "", rx, ry, seed = 1, delay = "0s" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const vbW = 2 * (rx + PAD);
  const vbH = 2 * (ry + PAD);
  const shape = makeShape(seed);
  const rest = toPath(points(rx, ry, vbW / 2, vbH / 2, shape, new Array(N).fill(0), 0, 0));

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    const sh = makeShape(seed);
    const cx = vbW / 2;
    const cy = vbH / 2;
    const reach = Math.max(rx, ry) + 16; // how close the cursor has to get before the outline reacts
    const d = new Array<number>(N).fill(0);
    const v = new Array<number>(N).fill(0);
    let ox = 0;
    let oy = 0;
    let vx = 0;
    let vy = 0;
    let cursor: { x: number; y: number } | null = null;
    let raf = 0;
    let last = 0;
    let visible = false;

    const mq = matchMedia("(prefers-reduced-motion: reduce)");

    const frame = (now: number) => {
      const h = Math.min(2, (now - last) / 16.667);
      last = now;

      const rect = svg.getBoundingClientRect();
      const scale = rect.width ? vbW / rect.width : 1;
      const cur = cursor ? { x: (cursor.x - rect.left) * scale, y: (cursor.y - rect.top) * scale } : null;

      const pts = points(rx, ry, cx, cy, sh, d, ox, oy);
      const target = new Array<number>(N);
      for (let i = 0; i < N; i++) {
        let dent = 0;
        if (cur) {
          const dist = Math.hypot(pts[i][0] - cur.x, pts[i][1] - cur.y);
          const w = Math.min(1, Math.max(0, 1 - dist / reach));
          dent = -DEPTH * w * w * (3 - 2 * w);
        }
        target[i] = IDLE * Math.sin(now * sh[i].w + sh[i].ph) + dent;
      }

      for (let i = 0; i < N; i++) {
        // Blend with neighbours so the dent is a broad bowl, not a spike.
        const t = 0.5 * target[i] + 0.25 * (target[(i - 1 + N) % N] + target[(i + 1) % N]);
        v[i] += (K * (t - d[i]) - C * v[i]) * h;
        d[i] = Math.min(MAX_S - 1, Math.max(MIN_S - 1, d[i] + v[i] * h));
      }

      // The whole blob also gives way a little, away from the cursor.
      let tx = 0;
      let ty = 0;
      if (cur) {
        const dx = cx + ox - cur.x;
        const dy = cy + oy - cur.y;
        const dist = Math.hypot(dx, dy) || 1;
        const w = Math.min(1, Math.max(0, 1 - dist / (reach * 1.6)));
        tx = (dx / dist) * w * 10;
        ty = (dy / dist) * w * 10;
      }
      vx += (K * (tx - ox) - C * vx) * h;
      vy += (K * (ty - oy) - C * vy) * h;
      ox += vx * h;
      oy += vy * h;

      path.setAttribute("d", toPath(points(rx, ry, cx, cy, sh, d, ox, oy)));
      raf = requestAnimationFrame(frame);
    };

    const run = () => {
      if (raf || !visible || document.hidden || mq.matches) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const halt = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) run();
      else halt();
    });
    io.observe(svg);

    const onMove = (e: PointerEvent) => {
      cursor = e.pointerType === "touch" ? null : { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      cursor = null;
    };
    const onVisibility = () => (document.hidden ? halt() : run());
    const onMotion = () => (mq.matches ? halt() : run());

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    mq.addEventListener("change", onMotion);

    return () => {
      halt();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener("change", onMotion);
    };
  }, [rx, ry, seed, vbW, vbH]);

  return (
    <svg
      ref={svgRef}
      className={`float-slow pointer-events-none overflow-visible ${className}`}
      style={{ animationDelay: delay }}
      viewBox={`0 0 ${vbW} ${vbH}`}
      aria-hidden
      focusable="false"
    >
      <path ref={pathRef} d={rest} fill="currentColor" suppressHydrationWarning />
    </svg>
  );
}
