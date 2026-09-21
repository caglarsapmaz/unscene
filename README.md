# Unscene

**Remove the background. Keep the subject.**

A free, ad-free background remover with no account. The model runs inside your
browser, so your image is never uploaded anywhere.

- English and Turkish, light and dark
- JPG, PNG and WEBP in, transparent PNG out (`original-name-no-bg.png`)
- Drag and drop anywhere on the page, click to browse, or paste
- Before/after slider on a checkerboard, keyboard accessible
- No server-side processing, no paid API, no environment variables required

## Technology stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, CSS variables for the design tokens |
| Inference | ONNX Runtime Web 1.30 in a Web Worker |
| Model | IS-Net (general use), int8 on WebAssembly or fp16 on WebGPU |
| Icons | Lucide, plus two hand-drawn brand icons (Lucide 1.x dropped brand icons) |
| Fonts | Outfit via `next/font` (self-hosted at build time) |

Runtime dependencies are `next`, `react`, `react-dom`, `onnxruntime-web` and `lucide-react`. Nothing else.

## How background removal works

1. The page hands your file to a **Web Worker**, so the UI stays responsive.
2. The worker decodes the image (`createImageBitmap`, EXIF orientation respected) and
   resizes a copy to 1024 x 1024 for the network.
3. On first use it downloads the model, streams it with real byte progress, and stores
   it in **Cache Storage**. Later visits skip the download.
4. ONNX Runtime Web runs the model. If the browser has WebGPU with `shader-f16`, it uses
   the fp16 model on the GPU. Otherwise it uses the int8 model on WebAssembly
   (multi-threaded when the page is cross-origin isolated). If WebGPU fails at any point
   the worker falls back to WebAssembly on its own.
5. The output is a soft alpha matte. It is min-max normalised, levelled slightly to drop
   faint noise, scaled to the original size and applied to the full-resolution image with
   an `OffscreenCanvas` (`destination-in`), then exported as PNG.

Limits: 25 MB per file. The long side is capped at 4096 px (2560 px on devices reporting
4 GB of RAM or less). The worker is terminated after 90 seconds of idleness to release
the model's memory.

### Why this technology

- **Client-side is the only architecture that keeps the privacy promise honest and costs
  nothing to host.** Server-side inference would need long-running or GPU compute, which
  Vercel Free does not provide.
- **`@imgly/background-removal` was evaluated and not used.** It is a good library, but it
  is licensed AGPL-3.0, which would force this whole project under AGPL. Its IS-Net
  weights descend from the same Apache-2.0 upstream used here, so nothing is lost.
- **RMBG-1.4 and RMBG-2.0 were rejected** because their licenses are non-commercial.
- **BiRefNet_lite (MIT)** is a fine alternative and sharper on hair, but its smallest
  usable ONNX is 114 MB, too heavy for a first load on mobile.
- **ONNX Runtime Web directly, not Transformers.js**, to keep the dependency tree small
  and control the download, caching and fallback behaviour.

## Privacy

- Images are processed on your device and never sent to a server.
- Images are held in memory only while the tab is open. Nothing is written to disk or cache.
- The **model file** is downloaded from Hugging Face's CDN on first use (about 46 MB, or
  88 MB on WebGPU) and cached in your browser. Hugging Face and Vercel see ordinary
  request data such as IP address, like any host. Your image is not part of any request.
- No analytics, no cookies. `localStorage` stores your language and theme choice only.

## Local development

```bash
npm install        # also copies the ONNX Runtime WASM files into public/ort
npm run dev        # http://localhost:3000
```

Other scripts: `npm run lint`, `npm run typecheck`, `npm run build`, `npm start`.

`public/ort/` is generated (by `scripts/copy-ort.mjs` on `postinstall`, `predev` and
`prebuild`) and git-ignored. ONNX Runtime needs its `.wasm` binaries and loaders served
from your own origin so multi-threading works without a third-party CDN.

## Deploying to Vercel

No configuration is needed. Import the repo, keep the defaults, deploy.

- Everything is static. There are no serverless functions and no server-side processing.
- `next.config.ts` sends `Cross-Origin-Opener-Policy: same-origin` and
  `Cross-Origin-Embedder-Policy: require-corp` on every route. This enables
  `SharedArrayBuffer` for multi-threaded WebAssembly. Anything you add later that loads
  cross-origin sub-resources (images, iframes, scripts) must be CORS/CORP-enabled.
- Optional: set `NEXT_PUBLIC_SITE_URL` to your domain for correct Open Graph and sitemap URLs.
- Vercel's Hobby plan is meant for personal, non-commercial use. This project is free
  and ad-free, which fits, but check Vercel's terms for your situation.
- The `public/ort` files are about 41 MB in total and are only downloaded by visitors
  who process an image. They are cached with a one-year `immutable` header under a
  versioned path.

### Self-hosting the model

The default model files come from a public Hugging Face repository
(`Ko033/isnet-general-use-onnx`). It is a third-party repackaging, so if you need
guarantees, host the files yourself:

1. Download `model_fp16.onnx` and `model_quantized.onnx` from that repo.
2. Serve them from any CORS-enabled static host (or your own `public/` folder, keeping in
   mind Vercel Free's bandwidth allowance).
3. Set `NEXT_PUBLIC_MODEL_BASE_URL` to the folder URL and rebuild. If you change the
   files, update the byte sizes in `src/lib/model.ts`.

## Model and license information

| Component | Author | License |
| --- | --- | --- |
| IS-Net weights and architecture (DIS) | Xuebin Qin et al. | Apache-2.0 |
| `isnet-general-use.onnx` export | rembg project | MIT |
| fp16 and int8 variants, auxiliary outputs stripped | Ko033 on Hugging Face | Apache-2.0 (as declared on the model card) |
| ONNX Runtime Web | Microsoft | MIT |
| Next.js, React | Vercel, Meta | MIT |
| Lucide icons | Lucide contributors | ISC |
| Outfit | Outfit Project Authors | SIL OFL 1.1 |

Model pages:
[DIS](https://github.com/xuebinqin/DIS) ·
[rembg](https://github.com/danielgatis/rembg) ·
[Ko033/isnet-general-use-onnx](https://huggingface.co/Ko033/isnet-general-use-onnx).
Licenses above were read from those upstream pages at the time of writing. Re-check them
before commercial redistribution of the model files.

## Design system

Soft, light and rounded, with one geometric typeface. The layout follows a reference
mockup; the colours are exactly the four in its palette sheet.

| Role | Colour |
| --- | --- |
| Primary | `#0B3D91` |
| Secondary | `#3BA7F2` |
| Tertiary | `#7FE7D6` |
| Background | `#E8F6FF` |

Surfaces, ink, muted text and lines are derived from these (tints and mixes), never
introduced as new hues. The site always opens in light mode; dark is opt-in and remembered.
Dark mode uses a mid navy (`#182D5A`) built from the primary, the palette background as
ink, secondary for accents and tertiary for the main button.

- **Controls** language is plain `EN / TR` text with the active one bold and underlined; the
  theme switch is two ghost icons with a soft circle behind the active one.
- **Radius** 8 (small controls), 12 (buttons), 20 (cards, dropzone), full for chips and pills.
- **Border** 1px, dropzone 1.5px dashed. **Shadow** one soft two-layer shadow.
- **Type** Outfit only: 500 for display, 400 for body, 500 uppercase for labels.
- **Motion** 120 ms micro, 200 ms state, 600 ms reveal. All of it collapses under
  `prefers-reduced-motion`.
- Tokens live in `src/app/globals.css`; components share `.btn`, `.chip`, `.card`, `.dz`,
  `.icon-btn` and `.lang-btn` instead of inventing their own styles.
- Contrast note: the second hero line uses the secondary colour (`#3BA7F2`) on the light
  background. That is about 2.4:1, fine for very large display type but below WCAG's 3:1.
  Switch `--display-2` to `--primary` in `globals.css` if you need it to pass.

## Project layout

```
src/app/            layout, page, metadata, icons, OG image, robots, sitemap
src/components/     header, footer, workspace (hero/upload/result), hero-demo, sections, compare slider
src/lib/            messages (EN/TR), prefs (locale/theme), use-remover, model config
src/workers/        remover.worker.ts (all inference and compositing)
scripts/            copy-ort.mjs
```

## License

MIT, see [LICENSE](./LICENSE). Made by Çağlar Sapmaz.
