import { useEffect } from "react";

interface ImagePreviewOverlayProps {
  imageUrl: string;
  onClose: () => void;
  plantName: string;
}

export function ImagePreviewOverlay({ imageUrl, onClose, plantName }: ImagePreviewOverlayProps) {
  // ESC 键关闭
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    // 阻止背景滚动
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      aria-label={`${plantName}大图预览`}
      onClick={onClose}
      role="dialog"
      style={overlayStyle}
    >
      {/* 关闭按钮 */}
      <button
        aria-label="关闭预览"
        onClick={onClose}
        style={closeButtonStyle}
        type="button"
      >
        ×
      </button>

      {/* 图片 */}
      <img
        alt={`${plantName}大图`}
        onClick={(e) => e.stopPropagation()}
        src={imageUrl}
        style={imageStyle}
      />
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(22, 52, 47, 0.85)",
  backdropFilter: "blur(4px)",
  animation: "preview-overlay-in 200ms ease-out",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "var(--space-md)",
  right: "var(--space-md)",
  appearance: "none",
  width: "40px",
  height: "40px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  borderRadius: "var(--radius-pill)",
  background: "transparent",
  color: "var(--color-paper)",
  fontSize: "24px",
  fontWeight: 300,
  opacity: 0.8,
  cursor: "pointer",
};

const imageStyle: React.CSSProperties = {
  maxWidth: "90vw",
  maxHeight: "80vh",
  objectFit: "contain",
  borderRadius: "var(--radius-card)",
  animation: "preview-image-in 360ms cubic-bezier(0.22, 1, 0.36, 1)",
};
