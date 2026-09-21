"use client";

import { useEffect, useRef, useState } from "react";
import { CloudUpload, Download, EyeOff, Info, Lock, RotateCcw, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { useLocale } from "@/lib/prefs";
import { MODELS } from "@/lib/model";
import { useRemover, type RemoverState } from "@/lib/use-remover";
import { Compare } from "./compare";
import { HeroDemo } from "./hero-demo";
import { SoftBlob } from "./soft-blob";

const ACCEPT = "image/jpeg,image/png,image/webp";
const wrap = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";

const mb = (bytes: number) => (bytes / 1e6).toFixed(1);
const pretty = (bytes: number) => (bytes >= 1e6 ? `${mb(bytes)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`);

function imageFrom(files: FileList | File[] | null | undefined) {
  return Array.from(files ?? []).find((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(f.name));
}

const TRUST_ICONS = [Lock, EyeOff, ShieldCheck];

export function Workspace() {
  const { t } = useLocale();
  const { state, submit, cancel, reset } = useRemover();
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const section = useRef<HTMLElement>(null);
  const downloadBtn = useRef<HTMLAnchorElement>(null);
  const idle = state.kind === "idle" || state.kind === "error";

  // Drop or paste anywhere on the page, not only on the zone.
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes("Files");
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth++;
      setDragging(true);
    };
    const over = (e: DragEvent) => hasFiles(e) && e.preventDefault();
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      const f = e.dataTransfer?.files[0];
      if (f) submit(f);
    };
    const paste = (e: ClipboardEvent) => {
      const f = imageFrom(e.clipboardData?.files);
      if (f) {
        e.preventDefault();
        submit(f);
      }
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    window.addEventListener("paste", paste);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
      window.removeEventListener("paste", paste);
    };
  }, [submit]);

  // When the result lands, bring it into view and put keyboard focus on the main action.
  useEffect(() => {
    if (state.kind !== "done") return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    downloadBtn.current?.focus({ preventScroll: true });
  }, [state.kind]);

  const pick = () => input.current?.click();

  return (
    <section ref={section} aria-label={t.name} className="scroll-mt-2">
      {idle && (
        <div className={`relative ${wrap} pt-10 pb-14 sm:pt-14 lg:pt-16 lg:pb-20`}>
          {/* soft blob bleeding off the left edge; it gives way to the cursor */}
          <SoftBlob className="absolute top-[17rem] -left-24 hidden w-44 text-secondary/45 lg:block" rx={70} ry={96} seed={7} />

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
            <div className="flex flex-col items-start">
              <span className="chip">{t.hero.chip}</span>
              <h1 className="display mt-5 text-[clamp(2.6rem,9vw,4.6rem)]">
                <span className="block">{t.hero.line1a}</span>
                <span className="block">{t.hero.line1b}</span>
                <span className="block text-[var(--display-2)] sm:whitespace-nowrap">{t.hero.line2}</span>
              </h1>
              <p className="mt-6 text-lg text-muted sm:text-xl">{t.hero.lede}</p>

              {state.kind === "error" && <Notice role="alert" text={t.errors[state.code]} action={t.errors.retry} onAction={pick} />}
              {state.kind === "idle" && state.cancelled && <Notice role="status" text={t.errors.cancelled} />}

              <label
                id="tool"
                data-drag={dragging}
                className="dz group relative mt-8 flex w-full cursor-pointer flex-col items-center gap-2 px-4 py-9 text-center has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-accent sm:py-10"
              >
                <input
                  ref={input}
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  aria-label={t.upload.aria}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = ""; // allow picking the same file again
                    if (f) submit(f);
                  }}
                />
                <CloudUpload size={38} strokeWidth={1.5} className="mb-1 text-accent" aria-hidden />
                <span className="text-[1.375rem] font-medium leading-tight sm:text-2xl">{dragging ? t.upload.release : t.upload.title}</span>
                <span className="text-[1.0625rem] text-muted">{t.upload.browse}</span>
                <span className="mt-2 text-sm tracking-[0.14em] text-muted">{t.upload.formats}</span>
                <span className="text-[0.8125rem] text-muted/90">{t.upload.hint}</span>
              </label>

              <ul className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-9">
                {t.hero.trust.map((label, i) => {
                  const Icon = TRUST_ICONS[i];
                  return (
                    <li key={label} className="flex items-center gap-3 text-[0.9375rem] text-muted">
                      <Icon size={24} strokeWidth={1.6} className="shrink-0 text-ink" aria-hidden />
                      <span className="max-w-[12rem]">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="hidden lg:block">
              <HeroDemo />
            </div>
          </div>
        </div>
      )}

      {state.kind === "working" && (
        <div id="tool" className={`${wrap} py-10 sm:py-14`}>
          <h1 className="sr-only">{t.name}</h1>
          <Working state={state} cancel={cancel} />
        </div>
      )}

      {state.kind === "done" && (
        <div id="tool" className={`${wrap} py-10 sm:py-14`}>
          <h1 className="sr-only">{t.name}</h1>
          <div className="card rise">
            <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-4 sm:px-6">
              <h2 className="chip">{t.result.label}</h2>
              <span className="text-sm text-muted tabular-nums">
                {state.width} × {state.height} px
              </span>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="p-3 sm:p-6">
                <Compare
                  original={state.originalUrl}
                  result={state.resultUrl}
                  width={state.width}
                  height={state.height}
                  labels={{
                    original: t.result.original,
                    transparent: t.result.transparent,
                    compare: t.result.compare,
                    altOriginal: t.result.altOriginal,
                    altResult: t.result.altResult,
                  }}
                />
              </div>

              <aside className="flex flex-col gap-6 border-t border-line p-4 sm:p-6 lg:border-t-0 lg:border-l">
                <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
                  <Row k={t.result.file} v={state.fileName} />
                  <Row k={t.result.size} v={pretty(state.bytes)} />
                  <Row k={t.result.engine} v={state.backend === "webgpu" ? `${t.result.gpu} · WebGPU` : `${t.result.cpu} · WASM`} />
                  <Row k={t.result.time} v={`${(state.ms / 1000).toFixed(1)} s`} />
                </dl>

                <div className="flex flex-col gap-3">
                  <a ref={downloadBtn} href={state.resultUrl} download={state.fileName} className="btn btn-primary w-full">
                    <Download size={19} strokeWidth={1.75} aria-hidden />
                    {t.result.download}
                  </a>
                  <button type="button" onClick={reset} className="btn w-full">
                    <RotateCcw size={16} strokeWidth={1.75} aria-hidden />
                    {t.result.startOver}
                  </button>
                </div>

                <p className="flex items-start gap-2.5 text-sm text-muted" role="status">
                  <ShieldCheck size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  {t.result.kept}
                </p>
              </aside>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="label pt-0.5 text-muted">{k}</dt>
      <dd className="break-all">{v}</dd>
    </>
  );
}

function Notice({ role, text, action, onAction }: { role: "alert" | "status"; text: string; action?: string; onAction?: () => void }) {
  return (
    <div role={role} className="rise mt-6 flex w-full flex-col gap-3 rounded-xl border border-line-strong bg-tint p-4 sm:flex-row sm:items-center sm:gap-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-accent">
        {role === "alert" ? <TriangleAlert size={19} strokeWidth={1.75} aria-hidden /> : <Info size={19} strokeWidth={1.75} aria-hidden />}
      </span>
      <p className="flex-1 text-[0.9375rem]">{text}</p>
      {action && (
        <button type="button" onClick={onAction} className="btn min-h-10 shrink-0 bg-surface">
          {action}
        </button>
      )}
    </div>
  );
}

function Working({ state, cancel }: { state: Extract<RemoverState, { kind: "working" }>; cancel: () => void }) {
  const { t } = useLocale();
  const dl = state.stage === "download" ? state.download : undefined;
  const pct = dl ? Math.min(100, (dl.loaded / dl.total) * 100) : 0;
  const total = dl?.total ?? MODELS.int8.bytes;

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-6">
        <span className="chip">{t.working.label}</span>
        <button type="button" onClick={cancel} className="btn min-h-10 px-4">
          <X size={16} strokeWidth={1.75} aria-hidden />
          {t.working.cancel}
        </button>
      </div>

      <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-10">
        <div className="checker grid h-48 place-items-center overflow-hidden rounded-xl border border-line md:h-64">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.previewUrl} alt="" className="h-full w-full object-contain opacity-90" />
        </div>

        <div className="flex flex-col justify-center gap-5">
          <p role="status" aria-live="polite" className="display text-[clamp(1.5rem,3.6vw,2.25rem)]" style={{ lineHeight: 1.1 }}>
            {t.working.stages[state.stage]}
          </p>

          {dl ? (
            <div className="flex flex-col gap-2">
              <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={t.working.model}>
                <i style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-sm text-muted tabular-nums">
                <span>
                  {t.working.model} · {mb(dl.loaded)} / {mb(dl.total)} MB
                </span>
                <span>{Math.round(pct)}%</span>
              </div>
            </div>
          ) : (
            <div className="bar bar-indeterminate" role="progressbar" aria-label={t.working.stages[state.stage]}>
              <i />
            </div>
          )}

          <div className="flex flex-col gap-1.5 text-sm text-muted">
            <p>{t.working.local}</p>
            {state.stage === "download" && <p>{t.working.firstRun.replace("{mb}", String(Math.round(total / 1e6)))}</p>}
            {state.fellBack && <p>{t.working.cpuFallback}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
