import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#e8f6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="132" height="132" viewBox="0 0 32 32">
          <circle cx="12" cy="16" r="9" fill="#0b3d91" />
          <circle cx="20" cy="16" r="9" fill="#3ba7f2" />
          <path d="M16 7.94A9 9 0 0 0 16 24.06 9 9 0 0 0 16 7.94Z" fill="#7fe7d6" />
        </svg>
      </div>
    ),
    size,
  );
}
