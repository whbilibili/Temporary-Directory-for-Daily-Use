import type { AppPath } from "../../app/router";
import { navigate } from "../../app/router";

interface BottomNavProps {
  pathname: AppPath;
}

const navItems: Array<{ href: AppPath; label: string; icon: string }> = [
  { href: "/todo", label: "待办", icon: "待办" },
  { href: "/plants", label: "植物", icon: "植物" },
  { href: "/settings", label: "设置", icon: "设置" },
];

export function BottomNav({ pathname }: BottomNavProps) {
  return (
    <nav aria-label="主导航" style={navStyle}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/plants" ? pathname.startsWith("/plants") : pathname === item.href;

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => navigate(item.href)}
            aria-current={isActive ? "page" : undefined}
            style={{
              ...itemStyle,
              ...(isActive ? activeItemStyle : null),
            }}
          >
            <span aria-hidden="true" style={iconStyle}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const navStyle: React.CSSProperties = {
  position: "sticky",
  bottom: 0,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "var(--space-sm)",
  padding: "var(--space-sm) var(--space-md) calc(var(--space-sm) + env(safe-area-inset-bottom, 0px))",
  borderTop: "1px solid var(--color-line)",
  background: "rgba(251,252,247,0.92)",
  backdropFilter: "blur(12px)",
};

const itemStyle: React.CSSProperties = {
  appearance: "none",
  border: "1px solid transparent",
  borderRadius: "var(--radius-button)",
  background: "var(--color-surface)",
  color: "var(--color-muted)",
  height: "56px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-xs)",
  fontSize: "10px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "transform 160ms ease, border-color 160ms ease, color 160ms ease",
};

const activeItemStyle: React.CSSProperties = {
  borderColor: "var(--color-line)",
  color: "var(--color-leaf)",
  transform: "translateY(-1px)",
};

const iconStyle: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: 1,
  letterSpacing: "0.04em",
};
