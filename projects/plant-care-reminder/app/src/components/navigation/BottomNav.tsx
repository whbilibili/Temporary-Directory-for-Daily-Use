import type { AppPath } from "../../app/router";
import { navigate } from "../../app/router";

interface BottomNavProps {
  pathname: AppPath;
}

const navItems: Array<{ href: AppPath; label: string; icon: string }> = [
  { href: "/plants", label: "Plants", icon: "Leaf" },
  { href: "/todo", label: "Inbox", icon: "Due" },
  { href: "/settings", label: "Home", icon: "Nest" },
];

export function BottomNav({ pathname }: BottomNavProps) {
  return (
    <nav aria-label="Primary" style={navStyle}>
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
            <span style={iconStyle}>{item.icon}</span>
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
  gap: "12px",
  padding: "14px 16px calc(14px + env(safe-area-inset-bottom, 0px))",
  borderTop: "1px solid #d9e2ec",
  background: "rgba(248,250,252,0.92)",
  backdropFilter: "blur(12px)",
};

const itemStyle: React.CSSProperties = {
  appearance: "none",
  border: "1px solid transparent",
  borderRadius: "18px",
  background: "#ffffff",
  color: "#475569",
  minHeight: "60px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  fontSize: "0.85rem",
  fontWeight: 700,
  cursor: "pointer",
  transition: "transform 160ms ease, border-color 160ms ease, color 160ms ease",
};

const activeItemStyle: React.CSSProperties = {
  borderColor: "#93c5fd",
  color: "#2563eb",
  transform: "translateY(-1px)",
};

const iconStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};
