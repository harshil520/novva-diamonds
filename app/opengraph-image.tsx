import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/config";

export const alt = `${siteConfig.brand.name}: certified loose diamonds from Surat`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f6f4ef",
          color: "#121212",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, textTransform: "uppercase" }}>{siteConfig.brand.name}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.02, letterSpacing: -2 }}>Certified loose diamonds</div>
          <div style={{ fontSize: 84, lineHeight: 1.02, letterSpacing: -2, fontStyle: "italic", color: "#6b675f" }}>from Surat, India</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6b675f" }}>Natural and lab-grown · GIA and IGI certified · Insured worldwide shipping</div>
      </div>
    ),
    size
  );
}
