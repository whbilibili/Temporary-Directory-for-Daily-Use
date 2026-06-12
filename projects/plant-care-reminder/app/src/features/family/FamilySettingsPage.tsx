import { useQuery } from "convex/react";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { NotificationPromptCard } from "../notifications/NotificationPromptCard";
import { FamilyHeroCard } from "./FamilyHeroCard";
import { InviteCodeCard } from "./InviteCodeCard";
import { MembersList } from "./MembersList";
import { SettingCardHeader } from "./SettingCardHeader";
import { SettingsGroup } from "./SettingsGroup";

export function FamilySettingsPage() {
  const { signOut } = useAuthActions();
  const summary = useQuery(api.families.getFamilySettingsSummary, {});
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        <h1 style={pageTitleStyle}>设置</h1>
        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>正在加载家庭信息…</h2>
          <p style={bodyStyle}>正在同步最新的邀请码和家庭成员列表。</p>
        </section>
      </section>
    );
  }

  const currentMember = summary.members.find((member) => member.isCurrentUser);
  const myDisplayName = currentMember?.displayName ?? "我";
  const isAdmin = summary.currentUserRole === "admin";

  return (
    <section style={pageStyle}>
      <h1 style={pageTitleStyle}>设置</h1>

      <SettingsGroup title="个人">
        <section style={cardStyle}>
          <SettingCardHeader eyebrow="我的称呼" icon="🙂" title={myDisplayName} />
          <p style={bodyStyle}>{summary.myEmail ?? "已登录"}</p>
          <Button
            onClick={() => void handleSignOut()}
            style={logoutButtonStyle}
            type="button"
            variant="ghost"
          >
            {isSigningOut ? "退出中…" : "退出登录"}
          </Button>
        </section>
      </SettingsGroup>

      <SettingsGroup title="家庭">
        <FamilyHeroCard
          familyName={summary.familyName}
          memberCount={summary.memberCount}
        />

        <InviteCodeCard inviteCode={summary.inviteCode} isAdmin={isAdmin} />

        <section style={cardStyle}>
          <SettingCardHeader eyebrow="家庭成员" icon="👥" title="家庭成员" />
          <MembersList members={summary.members} />
        </section>
      </SettingsGroup>

      <SettingsGroup title="通知与应用">
        <NotificationPromptCard />
      </SettingsGroup>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  // 组间间距 --space-lg；底部预留 80px 安全区，避免被底部导航遮挡。
  gap: "var(--space-lg)",
  paddingBottom: "80px",
};

const pageTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-ink)",
  fontFamily: "var(--font-heading)",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: 1.2,
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
