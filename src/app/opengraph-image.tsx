import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(145deg, #f7f8fb 0%, #eef1f5 45%, #e8ecf2 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(225, 29, 72, 0.16)",
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 36,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#12151c",
            fontWeight: 700,
          }}
        >
          Kast
          <span style={{ color: "#e11d48" }}>Match</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#12151c",
              maxWidth: 900,
            }}
          >
            Le set trouve
            <br />
            <span style={{ color: "#e11d48" }}>son talent.</span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#5b6572",
              maxWidth: 780,
              lineHeight: 1.35,
            }}
          >
            Matching IA réalisateurs ↔ talents · cinéma, pub, productions
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#5b6572",
          }}
        >
          Casting · Cinema · AI
        </div>
      </div>
    ),
    { ...size },
  );
}
