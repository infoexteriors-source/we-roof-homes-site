import { ImageResponse } from "next/og";
export const runtime = "nodejs";
export const alt = "WeRoof. Strong roofs. Straight answers.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#1a211e",
        padding: 75,
        color: "#fafaf7",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 27,
        }}
      >
        <strong style={{ color: "#ff5559" }}>WeRoof</strong>
        <span>MARYLAND ROOFING & EXTERIORS</span>
      </div>
      <div style={{ display:'flex',flexDirection:'column',fontSize: 85, fontWeight: 800, lineHeight: 1.05 }}>
        <span>Strong roofs.</span>
        <span>Straight answers.</span>
      </div>
      <div style={{ display: "flex", fontSize: 27, color: "#c5d0b2" }}>
        Free inspections & estimates · (240) 795-9365
      </div>
    </div>,
    size,
  );
}
