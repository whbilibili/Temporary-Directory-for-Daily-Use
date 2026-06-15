import { useQuery } from "convex/react";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

import { api } from "../../../convex/_generated/api";
import { ConfirmSheet } from "../../components/ui/ConfirmSheet";
import { NotificationPromptCard } from "../notifications/NotificationPromptCard";
import { NotificationTroubleshooting } from "../notifications/NotificationTroubleshooting";
import { AboutCard } from "./AboutCard";
import { FamilyHeroCard } from "./FamilyHeroCard";
import { FamilyNameEditSheet } from "./FamilyNameEditSheet";
import { InviteCodeCard } from "./InviteCodeCard";
import { MembersList } from "./MembersList";
import { NicknameEditSheet } from "./NicknameEditSheet";
import { SettingCardHeader } from "./SettingCardHeader";
import { SettingRow } from "./SettingRow";
import { SettingsGroup } from "./SettingsGroup";

export function FamilySettingsPage() {
  const { signOut } = useAuthActions();
  const summary = useQuery(api.families.getFamilySettingsSummary, {});
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [nicknameSheetOpen, setNicknameSheetOpen] = useState(false);
  const [familyNameSheetOpen, setFamilyNameSheetOpen] = useState(false);
  const [signOutSheetOpen, setSignOutSheetOpen] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      setIsSigningOut(false);
      setSignOutSheetOpen(false);
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
          <SettingCardHeader eyebrow="账号" icon="🙂" title="个人信息" />
          <div style={rowGroupStyle}>
            <SettingRow
              ariaLabel="修改我的称呼"
              icon="🙂"
              label="我的称呼"
              onClick={() => setNicknameSheetOpen(true)}
              value={myDisplayName}
            />
            <div style={dividerStyle} />
            <SettingRow
              icon="✉️"
              label="我的账号"
              value={summary.myEmail ?? "已登录"}
            />
          </div>
          <button
            onClick={() => setSignOutSheetOpen(true)}
            style={logoutButtonStyle}
            type="button"
          >
            退出登录
          </button>
        </section>
      </SettingsGroup>

      <SettingsGroup title="家庭">
        <FamilyHeroCard
          familyName={summary.familyName}
          memberCount={summary.memberCount}
          onRename={isAdmin ? () => setFamilyNameSheetOpen(true) : undefined}
        />

        <InviteCodeCard inviteCode={summary.inviteCode} isAdmin={isAdmin} />

        <section style={cardStyle}>
          <SettingCardHeader
            eyebrow="家庭"
            icon="👥"
            title={`成员（${summary.memberCount}）`}
          />
          <MembersList isAdmin={isAdmin} members={summary.members} />
        </section>
      </SettingsGroup>

      <SettingsGroup title="通知与应用">
        <NotificationPromptCard />
        <NotificationTroubleshooting />
        <AboutCard />
      </SettingsGroup>

      {nicknameSheetOpen ? (
        <NicknameEditSheet
          currentName={myDisplayName}
          onClose={() => setNicknameSheetOpen(false)}
        />
      ) : null}

      {familyNameSheetOpen ? (
        <FamilyNameEditSheet
          currentName={summary.familyName}
          onClose={() => setFamilyNameSheetOpen(false)}
        />
      ) : null}

      {signOutSheetOpen ? (
        <ConfirmSheet
          ariaLabel="退出登录确认"
          confirmLabel={isSigningOut ? "退出中…" : "退出登录"}
          description="退出后需要重新登录才能查看家庭和植物信息。"
          isSubmitting={isSigningOut}
          onCancel={() => setSignOutSheetOpen(false)}
          onConfirm={() => void handleSignOut()}
          title="确认退出登录吗？"
          variant="danger-outline"
        />
      ) : null}
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

const rowGroupStyle: React.CSSProperties = {
  display: "grid",
};

const dividerStyle: React.CSSProperties = {
  height: "1px",
  background: "var(--color-line)",
};

const logoutButtonStyle: React.CSSProperties = {
  appearance: "none",
  width: "100%",
  minHeight: "44px",
  borderRadius: "var(--radius-button)",
  background: "transparent",
  border: "1px solid var(--color-error)",
  color: "var(--color-error)",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};
