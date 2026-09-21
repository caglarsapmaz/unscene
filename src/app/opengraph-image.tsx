import { ImageResponse } from "next/og";

export const alt = "Unscene. Remove the background. Keep the subject.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#e8f6ff", color: "#0a1a3a", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 600 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <circle cx="12" cy="16" r="9" fill="#0b3d91" />
            <circle cx="20" cy="16" r="9" fill="#3ba7f2" />
            <path d="M16 7.94A9 9 0 0 0 16 24.06 9 9 0 0 0 16 7.94Z" fill="#7fe7d6" />
          </svg>
          unscene
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 112, fontWeight: 600, lineHeight: 1.02, letterSpacing: -4 }}>
          <span>Remove the background.</span>
          <span style={{ color: "#3ba7f2" }}>Keep the subject.</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 28, color: "#4a5f86" }}>
          <span>Free</span>·<span>No ads</span>·<span>No account</span>·<span>Your image stays in your browser</span>
        </div>
      </div>
    ),
    size,
  );
}
