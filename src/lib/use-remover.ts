"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Backend, FromWorker, RemoverErrorCode, Stage, ToWorker } from "./protocol";

export const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const IDLE_TERMINATE_MS = 90_000;

export type ErrorCode = RemoverErrorCode | "type" | "size";

export type RemoverState =
  | { kind: "idle"; cancelled?: boolean }
  | {
      kind: "working";
      previewUrl: string;
      stage: Stage;
      download?: { loaded: number; total: number };
      backend?: Backend;
      fellBack?: boolean;
    }
  | {
      kind: "done";
      originalUrl: string;
      resultUrl: string;
      fileName: string;
      width: number;
      height: number;
      bytes: number;
      backend: Backend;
      ms: number;
    }
  | { kind: "error"; code: ErrorCode };

type Action =
  | { type: "start"; previewUrl: string }
  | { type: "msg"; msg: Exclude<FromWorker, { type: "done" }> }
  | { type: "done"; msg: Extract<FromWorker, { type: "done" }>; previewUrl: string; resultUrl: string; fileName: string }
  | { type: "fail"; code: ErrorCode }
  | { type: "reset"; cancelled?: boolean };

function reducer(state: RemoverState, action: Action): RemoverState {
  switch (action.type) {
    case "start":
      return { kind: "working", previewUrl: action.previewUrl, stage: "decode" };
    case "fail":
      return { kind: "error", code: action.code };
    case "reset":
      return { kind: "idle", cancelled: action.cancelled };
    case "msg": {
      const { msg } = action;
      if (msg.type === "error") return { kind: "error", code: msg.code };
      if (state.kind !== "working") return state;
      if (msg.type === "download") return { ...state, download: { loaded: msg.loaded, total: msg.total } };
      return { ...state, stage: msg.stage, backend: msg.backend ?? state.backend, fellBack: msg.fellBack ?? state.fellBack };
    }
    case "done": {
      const { msg } = action;
      return {
        kind: "done",
        originalUrl: action.previewUrl,
        resultUrl: action.resultUrl,
        fileName: action.fileName,
        width: msg.width,
        height: msg.height,
        bytes: msg.blob.size,
        backend: msg.backend,
        ms: msg.ms,
      };
    }
  }
}

function isAccepted(file: File) {
  if (file.type) return ACCEPTED.includes(file.type);
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

export function outputName(original: string) {
  const base = original.replace(/\.[^.]+$/, "").trim() || "image";
  return `${base}-no-bg.png`;
}

function browserCanRun() {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof WebAssembly !== "undefined" &&
    typeof createImageBitmap !== "undefined"
  );
}

export function useRemover() {
  const [state, dispatch] = useReducer(reducer, { kind: "idle" });
  const worker = useRef<Worker | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const runId = useRef(0);
  const inFlight = useRef(false);
  const job = useRef<{ id: number; previewUrl: string; fileName: string } | null>(null);
  const urls = useRef<string[]>([]);

  const killWorker = useCallback(() => {
    inFlight.current = false;
    clearTimeout(idleTimer.current);
    worker.current?.terminate();
    worker.current = null;
  }, []);

  const releaseUrls = useCallback(() => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
  }, []);

  // Free the model's memory when the tab has been idle for a while.
  const scheduleIdleKill = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(killWorker, IDLE_TERMINATE_MS);
  }, [killWorker]);

  useEffect(
    () => () => {
      killWorker();
      releaseUrls();
    },
    [killWorker, releaseUrls],
  );

  // Handlers are attached once per worker and read the active job from a ref.
  const spawn = useCallback(() => {
    const w = new Worker(new URL("../workers/remover.worker.ts", import.meta.url), { type: "module" });
    w.onmessage = (ev: MessageEvent<FromWorker>) => {
      const msg = ev.data;
      const j = job.current;
      if (!j || msg.id !== j.id) return; // stale message from a cancelled run
      if (msg.type === "done") {
        const resultUrl = URL.createObjectURL(msg.blob);
        urls.current.push(resultUrl);
        dispatch({ type: "done", msg, previewUrl: j.previewUrl, resultUrl, fileName: j.fileName });
      } else {
        if (msg.type === "error") console.error("[unscene]", msg.code, msg.detail);
        if (msg.type === "stage" && msg.gpuError) console.warn("[unscene] WebGPU failed, using WASM:", msg.gpuError);
        dispatch({ type: "msg", msg });
      }
      if (msg.type === "done" || msg.type === "error") {
        inFlight.current = false;
        scheduleIdleKill();
      }
    };
    w.onerror = () => {
      dispatch({ type: "fail", code: "runtime" });
      killWorker();
    };
    return w;
  }, [killWorker, scheduleIdleKill]);

  const submit = useCallback(
    (file: File) => {
      releaseUrls();
      if (inFlight.current) killWorker(); // a new file replaces a run in progress
      if (!isAccepted(file)) return dispatch({ type: "fail", code: "type" });
      if (file.size > MAX_BYTES) return dispatch({ type: "fail", code: "size" });
      if (!browserCanRun()) return dispatch({ type: "fail", code: "unsupported" });

      let w = worker.current;
      if (!w) {
        try {
          w = spawn();
        } catch {
          return dispatch({ type: "fail", code: "unsupported" });
        }
        worker.current = w;
      }

      const previewUrl = URL.createObjectURL(file);
      urls.current.push(previewUrl);
      dispatch({ type: "start", previewUrl });

      const id = ++runId.current;
      job.current = { id, previewUrl, fileName: outputName(file.name) };
      clearTimeout(idleTimer.current);
      inFlight.current = true;

      const nav = navigator as Navigator & { deviceMemory?: number };
      const maxSide = (nav.deviceMemory ?? 8) <= 4 ? 2560 : 4096;
      const msg: ToWorker = { type: "run", id, file, maxSide };
      w.postMessage(msg);
    },
    [killWorker, releaseUrls, spawn],
  );

  const cancel = useCallback(() => {
    job.current = null;
    killWorker();
    releaseUrls();
    dispatch({ type: "reset", cancelled: true });
  }, [killWorker, releaseUrls]);

  const reset = useCallback(() => {
    releaseUrls();
    dispatch({ type: "reset" });
  }, [releaseUrls]);

  return { state, submit, cancel, reset };
}
