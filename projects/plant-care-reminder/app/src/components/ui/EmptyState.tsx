import type { CSSProperties, ReactNode } from "react";

interface EmptyStateProps {
  actions?: ReactNode;
  badge?: string;
  description: ReactNode;
  minHeight?: string;
  title: ReactNode;
}

export function EmptyState({
  actions,
  badge = "Placeholder",
  description,
  minHeight = "200px",
  title,
}: EmptyStateProps) {
  return (
    <div style={{ ...panelStyle, minHeight }}>
      <div style={contentStyle}>
        <span style={badgeStyle}>{badge}</span>
        <h2 style={titleStyle}>{title}</h2>
        <div style={descriptionStyle}>{description}</div>
        {actions ? <div style={actionsStyle}>{actions}</div> : null}
      </div>
    </div>
  );
}

const panelStyle: CSSProperties = {
  borderRadius: "20px",
  border: "1px dashed #bfdbfe",
  background: "linear-gradient(180deg, rgba(219,234,254,0.52), rgba(255,255,255,0.92))",
  padding: "18px",
  display: "flex",
  alignItems: "center",
};

const contentStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
};

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "fit-content",
  minHeight: "28px",
  padding: "0 12px",
  borderRadius: "999px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: "#1e293b",
  fontSize: "1.2rem",
  lineHeight: 1.2,
};

const descriptionStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "0.92rem",
  lineHeight: 1.6,
};

const actionsStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "6px",
};
