export const SITE_TITLE = "Free Background Remover — Remove Image Backgrounds Online";
export const SITE_DESCRIPTION =
  "Remove image backgrounds instantly for free. No ads, no account, and privacy-first browser processing.";

// Accepts "https://example.com", "example.com" or Vercel's bare host name. Empty or invalid means "not set".
// (An empty NEXT_PUBLIC_SITE_URL, e.g. pasted from .env.example, must never break the build.)
function toOrigin(raw?: string) {
  const v = raw?.trim();
  if (!v) return undefined;
  try {
    return new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`).origin;
  } catch {
    return undefined;
  }
}

// Set NEXT_PUBLIC_SITE_URL to your custom domain; Vercel's production URL is the fallback.
export const SITE_URL =
  toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
  toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  "http://localhost:3000";
