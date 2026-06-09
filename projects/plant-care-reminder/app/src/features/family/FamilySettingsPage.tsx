import { useQuery } from "convex/react";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
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
      <section style={cardStyle}>
        <PageHeader
          eyebrow="设置"
          title="正在加载家庭信息..."
          description={
            <p style={bodyStyle}>
              正在同步最新的邀请码和家庭成员列表。
            </p>
          }
        />
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <section style={heroCardStyle}>
        <PageHeader
          eyebrow="设置"
          title={summary.familyName}
          description={
            <p style={bodyStyle}>
              当前已有 {summary.memberCount} 位家庭成员加入这个共享植物空间。
            </p>
          }
        />
        <div style={heroActionsStyle}>
          <Button
            fullWidth={false}
            onClick={() => void handleSignOut()}
            type="button"
            variant="ghost"
          >
            {isSigningOut ? "退出中..." : "退出登录"}
          </Button>
        </div>
      </section>
      <section style={cardStyle}>
        <PageHeader
          eyebrow="邀请码"
          title="把这串邀请码分享给家人"
          description={
            <p style={bodyStyle}>
              家庭成员可以在加入家庭时输入这串邀请码，进入同一个植物看板和提醒列表。
            </p>
          }
        />
        <div style={invitePanelStyle}>
          <p style={inviteCodeStyle}>{summary.inviteCode}</p>
          <Button fullWidth={false} onClick={handleCopyInviteCode} type="button" variant="secondary">
            {copyStatus === "copied" ? "已复制" : "复制邀请码"}
          </Button>
          {copyStatus === "failed" ? (
            <p style={copyFeedbackStyle}>当前设备复制失败，你也可以手动把邀请码发给家人。</p>
          ) : null}
        </div>
      </section>
      <NotificationPromptCard />
      <section style={cardStyle}>
        <PageHeader
          eyebrow="成员"
          title="家庭成员"
          description={
            <p style={bodyStyle}>
              这里展示的是当前加入同一家庭空间的所有成员。
            </p>
          }
        />
        <MembersList members={summary.members} />
      </section>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const heroActionsStyle: React.CSSProperties = {
  marginTop: "18px",
  display: "flex",
  justifyContent: "flex-start",
};

const heroCardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "24px 22px",
  background:
    "linear-gradient(135deg, rgba(14,116,144,0.92), rgba(37,99,235,0.9) 52%, rgba(249,115,22,0.9))",
  color: "#f8fafc",
  boxShadow: "0 26px 58px rgba(14,116,144,0.18)",
};

const cardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "24px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "18px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const invitePanelStyle: React.CSSProperties = {
  borderRadius: "20px",
  border: "1px solid #bfdbfe",
  background: "linear-gradient(180deg, rgba(219,234,254,0.48), rgba(255,255,255,0.96))",
  padding: "18px",
  display: "grid",
  gap: "12px",
  justifyItems: "center",
  textAlign: "center",
};

const inviteCodeStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "2rem",
  lineHeight: 1,
  fontWeight: 800,
  letterSpacing: "0.18em",
};

const copyFeedbackStyle: React.CSSProperties = {
  margin: 0,
  color: "#b45309",
  fontSize: "0.88rem",
  lineHeight: 1.5,
};
