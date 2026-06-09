import { useState } from "react";

import { EmailLoginForm } from "./EmailLoginForm";

type AuthMode = "signIn" | "signUp";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signIn");

  return (
    <section style={pageStyle}>
      <header style={heroStyle}>
        <span aria-hidden="true" style={logoStyle}>
          🌿
        </span>
        <h1 style={heroTitleStyle}>从一个共享家庭开始养护植物</h1>
        <p style={heroSubtitleStyle}>
          用邮箱登录进入你的家庭植物看板，第一次使用也能直接创建账号。
        </p>
      </header>
      <div style={cardStyle}>
        <div role="tablist" style={toggleWrapStyle}>
          <button
            aria-pressed={mode === "signIn"}
            onClick={() => setMode("signIn")}
            style={mode === "signIn" ? activeToggleStyle : toggleStyle}
            type="button"
          >
            登录
          </button>
          <button
            aria-pressed={mode === "signUp"}
            onClick={() => setMode("signUp")}
            style={mode === "signUp" ? activeToggleStyle : toggleStyle}
            type="button"
          >
            创建账号
          </button>
        </div>
        <EmailLoginForm mode={mode} />
        <p style={hintStyle}>
          下次重新打开应用时，会自动恢复你当前的登录状态。
        </p>
      </div>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-lg)",
  padding: "var(--space-lg)",
  borderRadius: "var(--radius-sheet)",
  background: "var(--gradient-botanical), var(--gradient-accent)",
};

const heroStyle: React.CSSProperties = {
  maxHeight: "160px",
  display: "grid",
  gap: "var(--space-sm)",
  justifyItems: "center",
  textAlign: "center",
};

const logoStyle: React.CSSProperties = {
  fontSize: "2rem",
  lineHeight: 1,
};

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "1.5rem",
  lineHeight: 1.25,
  fontWeight: 700,
  color: "var(--color-ink)",
};

const heroSubtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.95rem",
  lineHeight: 1.5,
  color: "var(--color-muted)",
};

const cardStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-md)",
  padding: "var(--space-lg)",
  borderRadius: "var(--radius-card)",
  background: "rgba(255, 255, 255, 0.82)",
  boxShadow: "var(--shadow-card)",
  border: "1px solid var(--color-line)",
};

const toggleWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "var(--space-xs)",
  height: "36px",
  padding: "3px",
  borderRadius: "var(--radius-pill)",
  background: "rgba(255, 255, 255, 0.76)",
  border: "1px solid var(--color-line)",
};

const toggleStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "var(--radius-pill)",
  padding: "0 var(--space-md)",
  background: "transparent",
  color: "var(--color-muted)",
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
};

const activeToggleStyle: React.CSSProperties = {
  ...toggleStyle,
  background: "var(--color-leaf)",
  color: "var(--color-surface)",
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "0.85rem",
  lineHeight: 1.5,
};
