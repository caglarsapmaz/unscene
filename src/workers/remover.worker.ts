/// <reference lib="webworker" />
import type * as OrtNs from "onnxruntime-web";
import { MODEL_CACHE, MODEL_SIZE, MODELS } from "@/lib/model";
import type { Backend, FromWorker, RemoverErrorCode, Stage, ToWorker } from "@/lib/protocol";

type Ort = typeof OrtNs;
type Session = OrtNs.InferenceSession;

const ORT_BASE = `/ort/${process.env.NEXT_PUBLIC_ORT_VERSION}/`;

let ort: Ort | null = null;
let session: { backend: Backend; inst: Session; model: keyof typeof MODELS } | null = null;
let webgpuBroken = false;

const post = (msg: FromWorker) => self.postMessage(msg);

class RemoverError extends Error {
  constructor(
    public code: RemoverErrorCode,
    detail?: string,
  ) {
    super(detail ?? code);
  }
}

type CapNav = Navigator & {
  gpu?: { requestAdapter(): Promise<{ features: { has(f: string): boolean } } | null> };
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

async function canUseFp16WebGpu(): Promise<boolean> {
  const nav = navigator as CapNav;
  if (webgpuBroken || !nav.gpu) return false;
  // Small phones and data-saver users get the lighter download.
  if (nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory <= 4)) return false;
  try {
    const adapter = await nav.gpu.requestAdapter();
    return !!adapter && adapter.features.has("shader-f16");
  } catch {
    return false;
  }
}

async function fetchModel(
  id: number,
  url: string,
  fallbackBytes: number,
): Promise<ArrayBuffer> {
  const cache = "caches" in self ? await caches.open(MODEL_CACHE).catch(() => null) : null;
  const hit = await cache?.match(url).catch(() => undefined);
  if (hit) return hit.arrayBuffer();

  post({ type: "stage", id, stage: "download" });
  const res = await fetch(url).catch(() => null);
  if (!res || !res.ok || !res.body) throw new RemoverError("model", `HTTP ${res?.status ?? "network"}`);

  const total = Number(res.headers.get("content-length")) || fallbackBytes;
  const buf = new Uint8Array(total);
  let loaded = 0;
  let lastPost = 0;
  const reader = res.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (loaded + value.length > buf.length) throw new RemoverError("model", "size mismatch");
    buf.set(value, loaded);
    loaded += value.length;
    const now = performance.now();
    if (now - lastPost > 80) {
      lastPost = now;
      post({ type: "download", id, loaded, total });
    }
  }
  if (loaded !== total) throw new RemoverError("model", "truncated download");
  post({ type: "download", id, loaded, total });

  // Best effort: a failed cache write must never fail the run.
  cache?.put(url, new Response(buf, { headers: { "content-type": "application/octet-stream" } })).catch(() => {});
  return buf.buffer;
}

async function loadOrt(backend: Backend): Promise<Ort> {
  const mod: Ort =
    backend === "webgpu" ? await import("onnxruntime-web/webgpu") : await import("onnxruntime-web/wasm");
  mod.env.wasm.wasmPaths = ORT_BASE;
  mod.env.wasm.numThreads = self.crossOriginIsolated
    ? Math.max(1, Math.min(4, navigator.hardwareConcurrency || 2))
    : 1;
  return mod;
}

let gpuError: string | undefined;

async function getSession(id: number): Promise<{ backend: Backend; inst: Session; fellBack: boolean }> {
  if (session) return { ...session, fellBack: false };

  const wantGpu = await canUseFp16WebGpu();
  const attempts: Backend[] = wantGpu ? ["webgpu", "wasm"] : ["wasm"];
  let lastError: unknown;

  for (const backend of attempts) {
    const model = backend === "webgpu" ? "fp16" : "int8";
    try {
      const bytes = await fetchModel(id, MODELS[model].url, MODELS[model].bytes);
      post({ type: "stage", id, stage: "init", backend });
      ort = await loadOrt(backend);
      const inst = await ort.InferenceSession.create(new Uint8Array(bytes), {
        executionProviders: [backend],
        graphOptimizationLevel: "all",
      });
      session = { backend, inst, model };
      return { backend, inst, fellBack: backend === "wasm" && wantGpu };
    } catch (e) {
      lastError = e;
      if (backend === "webgpu") {
        webgpuBroken = true;
        gpuError = e instanceof Error ? e.message : String(e);
      }
    }
  }
  throw lastError instanceof RemoverError ? lastError : new RemoverError("model", String(lastError));
}

/** Min-max normalise the network output and level it lightly so faint noise drops out. */
function toMatte(raw: Float32Array): Float32Array {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < raw.length; i++) {
    const v = raw[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;
  const m = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    const n = (raw[i] - min) / range;
    m[i] = Math.min(1, Math.max(0, (n - 0.06) / 0.88));
  }
  return m;
}

// ---- Edge refinement ---------------------------------------------------------
// The network only outputs a 1024 x 1024 matte, so stretching it over a 3000 px photo gives
// soft, blocky edges. A guided filter (He et al.) re-fits the matte to the real image edges:
// coefficients are solved on a reduced copy, then applied per pixel at full resolution.
const REFINE_SIDE = 1536;
const REFINE_RADIUS = 0.003; // box radius as a fraction of the working long side
const REFINE_EPS = 3e-4;
const CURVE_LO = 0.12; // final levels curve, crushes leftover speckle near 0 and 1
const CURVE_HI = 0.88;

/** Mean over a (2r+1) window with edge replication, separable running sums. dst may equal src. */
function boxMean(src: Float32Array, dst: Float32Array, tmp: Float32Array, w: number, h: number, r: number) {
  const k = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let i = -r; i <= r; i++) sum += src[row + Math.min(w - 1, Math.max(0, i))];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / k;
      sum += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let i = -r; i <= r; i++) sum += tmp[Math.min(h - 1, Math.max(0, i)) * w + x];
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = sum / k;
      sum += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
}

function resizeBilinear(src: Float32Array, sw: number, sh: number, dw: number, dh: number): Float32Array {
  const out = new Float32Array(dw * dh);
  for (let y = 0; y < dh; y++) {
    const fy = Math.min(sh - 1, Math.max(0, ((y + 0.5) * sh) / dh - 0.5));
    const y0 = Math.floor(fy);
    const y1 = Math.min(sh - 1, y0 + 1);
    const wy = fy - y0;
    for (let x = 0; x < dw; x++) {
      const fx = Math.min(sw - 1, Math.max(0, ((x + 0.5) * sw) / dw - 0.5));
      const x0 = Math.floor(fx);
      const x1 = Math.min(sw - 1, x0 + 1);
      const wx = fx - x0;
      const top = src[y0 * sw + x0] * (1 - wx) + src[y0 * sw + x1] * wx;
      const bot = src[y1 * sw + x0] * (1 - wx) + src[y1 * sw + x1] * wx;
      out[y * dw + x] = top * (1 - wy) + bot * wy;
    }
  }
  return out;
}

/** Writes the refined alpha channel into `full` (RGBA, width x height). */
function refineInto(full: ImageData, bitmap: ImageBitmap, matte: Float32Array) {
  const { width: W, height: H, data } = full;
  const s = Math.min(1, REFINE_SIDE / Math.max(W, H));
  const lw = Math.max(1, Math.round(W * s));
  const lh = Math.max(1, Math.round(H * s));
  const n = lw * lh;

  // Low-res guide (luminance) from a properly filtered downscale of the image.
  const small = new OffscreenCanvas(lw, lh);
  const sctx = small.getContext("2d", { willReadFrequently: true })!;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(bitmap, 0, 0, lw, lh);
  const px = sctx.getImageData(0, 0, lw, lh).data;
  const I = new Float32Array(n);
  for (let i = 0; i < n; i++) I[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;

  const p = resizeBilinear(matte, MODEL_SIZE, MODEL_SIZE, lw, lh);
  const r = Math.max(2, Math.round(Math.max(lw, lh) * REFINE_RADIUS));
  const tmp = new Float32Array(n);
  const mI = new Float32Array(n);
  const mp = new Float32Array(n);
  const Ip = new Float32Array(n);
  const II = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    Ip[i] = I[i] * p[i];
    II[i] = I[i] * I[i];
  }
  boxMean(I, mI, tmp, lw, lh, r);
  boxMean(p, mp, tmp, lw, lh, r);
  boxMean(Ip, Ip, tmp, lw, lh, r);
  boxMean(II, II, tmp, lw, lh, r);

  const A = new Float32Array(n);
  const B = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = (Ip[i] - mI[i] * mp[i]) / (II[i] - mI[i] * mI[i] + REFINE_EPS);
    A[i] = a;
    B[i] = mp[i] - a * mI[i];
  }
  boxMean(A, A, tmp, lw, lh, r);
  boxMean(B, B, tmp, lw, lh, r);

  // Far from any edge the coarse matte is already exact: pin it to 0 or 1.
  boxMean(p, mp, tmp, lw, lh, r * 2);
  for (let i = 0; i < n; i++) {
    if (mp[i] < 0.004) {
      A[i] = 0;
      B[i] = 0;
    } else if (mp[i] > 0.996) {
      A[i] = 0;
      B[i] = 1;
    }
  }

  // Full-resolution pass: alpha = a * luminance + b, sampled bilinearly from the low-res maps.
  const x0 = new Int32Array(W);
  const x1 = new Int32Array(W);
  const wxs = new Float32Array(W);
  for (let x = 0; x < W; x++) {
    const fx = Math.min(lw - 1, Math.max(0, ((x + 0.5) * lw) / W - 0.5));
    x0[x] = Math.floor(fx);
    x1[x] = Math.min(lw - 1, x0[x] + 1);
    wxs[x] = fx - x0[x];
  }
  const span = CURVE_HI - CURVE_LO;
  for (let y = 0; y < H; y++) {
    const fy = Math.min(lh - 1, Math.max(0, ((y + 0.5) * lh) / H - 0.5));
    const ya = Math.floor(fy) * lw;
    const yb = Math.min(lh - 1, Math.floor(fy) + 1) * lw;
    const wy = fy - Math.floor(fy);
    for (let x = 0; x < W; x++) {
      const wx = wxs[x];
      const i00 = ya + x0[x];
      const i01 = ya + x1[x];
      const i10 = yb + x0[x];
      const i11 = yb + x1[x];
      const w00 = (1 - wx) * (1 - wy);
      const w01 = wx * (1 - wy);
      const w10 = (1 - wx) * wy;
      const w11 = wx * wy;
      const a = A[i00] * w00 + A[i01] * w01 + A[i10] * w10 + A[i11] * w11;
      const b = B[i00] * w00 + B[i01] * w01 + B[i10] * w10 + B[i11] * w11;
      const o = (y * W + x) * 4;
      const g = (0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]) / 255;
      const q = (a * g + b - CURVE_LO) / span;
      data[o + 3] = q <= 0 ? 0 : q >= 1 ? 255 : Math.round(q * 255);
    }
  }
}

function toTensorData(bitmap: ImageBitmap): Float32Array {
  const c = new OffscreenCanvas(MODEL_SIZE, MODEL_SIZE);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, MODEL_SIZE, MODEL_SIZE);
  const { data } = ctx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE);
  const plane = MODEL_SIZE * MODEL_SIZE;
  const out = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    // RGB, x / 255 - 0.5 (mean 0.5, std 1.0), CHW layout.
    out[i] = data[i * 4] / 255 - 0.5;
    out[plane + i] = data[i * 4 + 1] / 255 - 0.5;
    out[2 * plane + i] = data[i * 4 + 2] / 255 - 0.5;
  }
  return out;
}

async function run(id: number, file: Blob, maxSide: number) {
  const t0 = performance.now();
  const stage = (s: Stage) => post({ type: "stage", id, stage: s });

  stage("decode");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new RemoverError("decode");
  }

  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const input = toTensorData(bitmap);

    const { backend, inst, fellBack } = await getSession(id);
    post({ type: "stage", id, stage: "infer", backend, fellBack, gpuError });

    const tensor = new ort!.Tensor("float32", input, [1, 3, MODEL_SIZE, MODEL_SIZE]);
    let result: OrtNs.InferenceSession.OnnxValueMapType;
    try {
      result = await inst.run({ [inst.inputNames[0]]: tensor });
    } catch (e) {
      if (backend === "webgpu") {
        // GPU failed mid-run: drop to the CPU path and retry once.
        webgpuBroken = true;
        gpuError = e instanceof Error ? e.message : String(e);
        session = null;
        return run(id, file, maxSide);
      }
      throw e;
    }
    const raw = result[inst.outputNames[0]].data as Float32Array;

    stage("compose");
    const matte = toMatte(raw);
    const out = new OffscreenCanvas(width, height);
    const ctx = out.getContext("2d", { willReadFrequently: true })!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    const full = ctx.getImageData(0, 0, width, height);
    refineInto(full, bitmap, matte);
    ctx.putImageData(full, 0, 0);

    const blob = await out.convertToBlob({ type: "image/png" });
    post({ type: "done", id, blob, width, height, backend, ms: Math.round(performance.now() - t0) });
  } finally {
    bitmap.close();
  }
}

function classify(e: unknown): { code: RemoverErrorCode; detail: string } {
  if (e instanceof RemoverError) return { code: e.code, detail: e.message };
  const detail = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  const oom = e instanceof RangeError || /memory|alloc|buffer/i.test(detail);
  return { code: oom ? "memory" : "runtime", detail };
}

self.onmessage = async (ev: MessageEvent<ToWorker>) => {
  const msg = ev.data;
  if (msg.type !== "run") return;
  try {
    await run(msg.id, msg.file, msg.maxSide);
  } catch (e) {
    post({ type: "error", id: msg.id, ...classify(e) });
  }
};
