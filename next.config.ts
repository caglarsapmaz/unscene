import type { NextConfig } from "next";
import { readFileSync } from "node:fs";

const ortVersion = JSON.parse(
  readFileSync("./node_modules/onnxruntime-web/package.json", "utf8"),
).version as string;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false, // hides the round "N" badge shown only in `next dev`
  env: { NEXT_PUBLIC_ORT_VERSION: ortVersion },
  async headers() {
    return [
      {
        // Cross-origin isolation enables multi-threaded WASM (SharedArrayBuffer).
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Versioned path, so the binaries can be cached forever.
        source: "/ort/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
