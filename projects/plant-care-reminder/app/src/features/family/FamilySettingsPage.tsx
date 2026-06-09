import { useQuery } from "convex/react";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { NotificationPromptCard } from "../notifications/NotificationPromptCard";
import { MembersList } from "./MembersList";

export function FamilySettingsPage() {
  const { signOut } = useAuthActions();
  const summary = useQuery(api.families.getFamilySettingsSummary, {});
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleCopyInviteCode() {
    if (!summary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summary.inviteCode);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  if (summary === undefined) {
    return (
      <section style={pageStyle}>
        <section style={cardStyle}>
          <p style={cardEyebrowStyle}>设置</p>
          <h1 style={summaryTitleStyle}>正在加载家庭信息…</h1>
          <p style={bodyStyle}>正在同步最新的邀请码和家庭成员列表。</p>
        </section>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <section style={cardStyle}>
        <p style={cardEyebrowStyle}>家庭摘要</p>
        <h1 style={summaryTitleStyle}>{summary.familyName}</h1>
        <p style={bodyStyle}>
          当前已有 {summary.memberCount} 位家人加入这个共享植物看板。
        </p>
      </section>

      <section style={cardStyle}>
        <p style={cardEyebrowStyle}>邀请码与分享</p>
        <h2 style={cardTitleStyle}>把这串邀请码发给家人</h2>
        <p style={bodyStyle}>
          家人在加入家庭时输入这串邀请码，就能进入同一个植物看板和提醒列表。
        </p>
        <p style={inviteCodeStyle}>{summary.inviteCode}</p>
        <Button
          onClick={handleCopyInviteCode}
          style={copyButtonStyle}
          type="button"
          variant="primary"
        >
          {copyStatus === "copied" ? "已复制" : "复制邀请码"}
        </Button>
        {copyStatus === "failed" ? (
          <p style={copyFeedbackStyle}>当前设备复制失败，你也可以手动把邀请码发给家人。</p>
        ) : null}
      </section>

      <NotificationPromptCard />

      <section style={cardStyle}>
        <p style={cardEyebrowStyle}>家庭成员</p>
        <h2 style={cardTitleStyle}>家庭成员</h2>
        <MembersList members={summary.members} />
      </section>

      <div style={logoutWrapStyle}>
        <Button
          onClick={() => void handleSignOut()}
          style={logoutButtonStyle}
          type="button"
          variant="ghost"
        >
          {isSigningOut ? "退出中…" : "退出登录"}
        </Button>
      </div>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-md)",
};

const cardStyle: React.CSSProperties = {
  borderRadius: "var(--radius-card)",
  padding: "var(--space-md)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  boxShadow: "var(--shadow-card)",
  display: "grid",
  gap: "var(--space-sm)",
};

const cardEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-leaf-light)",
  fontSize: "12px",
  fontWeight: 700,
  lineHeight: 1.3,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const summaryTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-ink)",
  fontFamily: "var(--font-heading)",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: 1.2,
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-ink)",
  fontFamily: "var(--font-heading)",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: 1.25,
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "14px",
  lineHeight: 1.5,
};

const inviteCodeStyle: React.CSSProperties = {
  margin: "var(--space-xs) 0",
  color: "var(--color-leaf)",
  fontFamily: "var(--font-mono)",
  fontSize: "28px",
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: "0.12em",
  textAlign: "center",
};

const copyButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "44px",
  borderRadius: "var(--radius-button)",
  fontSize: "14px",
  fontWeight: 600,
};

const copyFeedbackStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-warning)",
  fontSize: "12px",
  lineHeight: 1.5,
};

const logoutWrapStyle: React.CSSProperties = {
  marginTop: "var(--space-xl)",
};

const logoutButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "44px",
  borderRadius: "var(--radius-button)",
  background: "transparent",
  border: "1px solid var(--color-error)",
  color: "var(--color-error)",
  fontSize: "14px",
  fontWeight: 500,
  boxShadow: "none",
};
