// Copies the ONNX Runtime WASM binaries + loaders into public/ort/<version>/ so they are
// served from our own origin (same-origin = threads work, no third-party CDN).
import { copyFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const pkgDir = join(process.cwd(), "node_modules", "onnxruntime-web");
if (!existsSync(pkgDir)) process.exit(0); // deps not installed yet

const { version } = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
const out = join(process.cwd(), "public", "ort", version);
mkdirSync(out, { recursive: true });

// Each backend needs its Emscripten loader (.mjs) next to its binary (.wasm).
for (const file of [
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm",
  "ort-wasm-simd-threaded.asyncify.mjs", // used by the onnxruntime-web/webgpu entry
  "ort-wasm-simd-threaded.asyncify.wasm",
]) {
  copyFileSync(join(pkgDir, "dist", file), join(out, file));
}
console.log(`ort ${version} wasm -> public/ort/${version}`);
