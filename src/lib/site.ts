export const SITE_TITLE = "Free Background Remover — Remove Image Backgrounds Online";
export const SITE_DESCRIPTION =
  "Remove image backgrounds instantly for free. No ads, no account, and privacy-first browser processing.";

// Set NEXT_PUBLIC_SITE_URL to your custom domain; Vercel's production URL is the fallback.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
