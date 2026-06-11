import { useState } from "react";

interface PlantImageProps {
  alt: string;
  imageUrl: string | null;
}

/**
 * Plant thumbnail with fade-in on load and graceful error fallback.
 * Renders at 80×80 with 12px border-radius (matches PlantCard image slot).
 */
export function PlantImage({ alt, imageUrl }: PlantImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    imageUrl ? "loading" : "error",
  );

  if (!imageUrl || status === "error") {
    return (
      <div style={placeholderStyle}>
        <span aria-hidden="true" style={placeholderIconStyle}>
          🌿
        </span>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={placeholderStyle}>
        <span aria-hidden="true" style={placeholderIconStyle}>
          🌿
        </span>
      </div>
      <img
        alt={alt}
        onError={() => setStatus("error")}
        onLoad={() => setStatus("loaded")}
        src={imageUrl}
        style={{
          ...imgStyle,
          opacity: status === "loaded" ? 1 : 0,
        }}
      />
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
};

const placeholderStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--color-mist)",
  borderRadius: "12px",
};

const placeholderIconStyle: React.CSSProperties = {
  fontSize: "32px",
  lineHeight: 1,
  opacity: 0.7,
};

const imgStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "12px",
  transition: "opacity 200ms ease-in",
};
