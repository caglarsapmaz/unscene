export type Backend = "webgpu" | "wasm";

export type Stage = "decode" | "download" | "init" | "infer" | "compose";

export type RemoverErrorCode =
  | "unsupported" // browser lacks Worker / WASM / OffscreenCanvas
  | "decode" // image could not be read
  | "model" // model download or session creation failed
  | "memory" // ran out of memory
  | "runtime"; // anything else during inference

export type ToWorker = { type: "run"; id: number; file: Blob; maxSide: number };

export type FromWorker =
  | { type: "stage"; id: number; stage: Stage; backend?: Backend; fellBack?: boolean; gpuError?: string }
  | { type: "download"; id: number; loaded: number; total: number }
  | {
      type: "done";
      id: number;
      blob: Blob;
      width: number;
      height: number;
      backend: Backend;
      ms: number;
    }
  | { type: "error"; id: number; code: RemoverErrorCode; detail?: string };
