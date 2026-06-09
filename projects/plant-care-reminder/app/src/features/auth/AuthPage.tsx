import { useState } from "react";

import { PageHeader } from "../../components/ui/PageHeader";
import { EmailLoginForm } from "./EmailLoginForm";

type AuthMode = "signIn" | "signUp";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signIn");

  return (
    <section style={cardStyle}>
      <PageHeader
        eyebrow="登录"
        title="从一个共享家庭开始管理植物。"
        description={
          <p style={bodyStyle}>
            使用邮箱登录即可继续进入你的家庭植物看板；如果是第一次使用，也可以直接创建账号。
          </p>
        }
      />
      <div style={toggleWrapStyle}>
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
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "28px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "20px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const toggleWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
  padding: "6px",
  borderRadius: "18px",
  background: "#e2e8f0",
};

const toggleStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "14px",
  minHeight: "44px",
  padding: "0 14px",
  background: "transparent",
  color: "#334155",
  fontWeight: 700,
  fontSize: "0.95rem",
};

const activeToggleStyle: React.CSSProperties = {
  ...toggleStyle,
  background: "#ffffff",
  color: "#0f172a",
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.92rem",
  lineHeight: 1.5,
};
