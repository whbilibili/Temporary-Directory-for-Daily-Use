import { navigate } from "../../app/router";

interface DetailNavBarProps {
  menuOpen?: boolean;
  plantName: string;
  onMenuToggle: () => void;
}

export function DetailNavBar({ menuOpen, plantName, onMenuToggle }: DetailNavBarProps) {
  return (
    <nav aria-label="植物详情导航" style={navStyle}>
      <button
        aria-label="返回"
        onClick={() => navigate("/plants")}
        style={backButtonStyle}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="20"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <span style={titleStyle}>{plantName}</span>

      <button
        aria-expanded={menuOpen ?? false}
        aria-haspopup="menu"
        aria-label="更多操作"
        onClick={onMenuToggle}
        style={menuButtonStyle}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="currentColor"
          height="20"
          viewBox="0 0 24 24"
          width="20"
        >
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
    </nav>
  );
}

const navStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "48px",
  padding: "0 var(--space-sm)",
  background: "var(--color-paper)",
};

const backButtonStyle: React.CSSProperties = {
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "44px",
  height: "44px",
  padding: 0,
  border: "none",
  borderRadius: "var(--radius-button)",
  background: "transparent",
  color: "var(--color-leaf)",
  cursor: "pointer",
};

const titleStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  maxWidth: "60%",
  fontSize: "15px",
  fontWeight: 600,
  color: "var(--color-ink)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const menuButtonStyle: React.CSSProperties = {
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "44px",
  height: "44px",
  padding: 0,
  border: "none",
  borderRadius: "var(--radius-button)",
  background: "transparent",
  color: "var(--color-muted)",
  cursor: "pointer",
};
