// IS-Net (general use): weights by Xuebin Qin et al. (DIS, Apache-2.0), ONNX graph
// exported by the rembg project (MIT), repackaged for the web by Ko033 on Hugging Face.
// Override with NEXT_PUBLIC_MODEL_BASE_URL to self-host the files (see README).
const BASE =
  process.env.NEXT_PUBLIC_MODEL_BASE_URL ??
  "https://huggingface.co/Ko033/isnet-general-use-onnx/resolve/main/onnx";

export const MODELS = {
  // ~88 MB, used when WebGPU with shader-f16 is available.
  fp16: { url: `${BASE}/model_fp16.onnx`, bytes: 88_141_111 },
  // ~46 MB dynamic int8, used on the WebAssembly (CPU) path.
  int8: { url: `${BASE}/model_quantized.onnx`, bytes: 45_902_969 },
} as const;

export const MODEL_SIZE = 1024; // network input is fixed at 1024 x 1024
export const MODEL_CACHE = "unscene-model-v1";
