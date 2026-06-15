import { useMutation, useQuery } from "convex/react";
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
import { AvatarUploadField } from "./AvatarUploadField";
import { SettingCardHeader } from "./SettingCardHeader";
import { SettingRow } from "./SettingRow";
import { SettingsGroup } from "./SettingsGroup";

/**
 * 把 leaveFamily 后端错误翻译为面向用户的友好中文文案（SET3-005）。
 * 唯一管理员被拒（后端文案含 "only admin"）单独兜底，其余统一兜底。
 */
function translateLeaveFamilyError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.toLowerCase().includes("only admin")) {
    return "你是这个家庭目前唯一的管理员，请先把管理员转交给其他家人，再退出家庭。";
  }
  return "退出家庭失败，请稍后再试。";
}

export function FamilySettingsPage() {
  const { signOut } = useAuthActions();
  const summary = useQuery(api.families.getFamilySettingsSummary, {});
  const leaveFamily = useMutation(api.families.leaveFamily);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [nicknameSheetOpen, setNicknameSheetOpen] = useState(false);
  const [familyNameSheetOpen, setFamilyNameSheetOpen] = useState(false);
  const [signOutSheetOpen, setSignOutSheetOpen] = useState(false);
  const [leaveSheetOpen, setLeaveSheetOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      setIsSigningOut(false);
      setSignOutSheetOpen(false);
    }
  }

  async function handleLeaveFamily() {
    setLeaveError(null);
    setIsLeaving(true);
    try {
      // 成功后用户 familyId 变为 null，RouteGate 会响应式重定向到 onboarding，
      // 此处无需手动跳转，仅在卸载前不再 setState 即可。
      await leaveFamily({});
    } catch (error) {
      setLeaveError(translateLeaveFamilyError(error));
      setIsLeaving(false);
    }
  }

  function closeLeaveSheet() {
    setLeaveSheetOpen(false);
    setLeaveError(null);
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

  // 最后一名成员退出 = 整个家庭被解散，后端会级联删除全部植物、提醒与养护记录（families.leaveFamily 分支二）。
  // 因此必须用更强的「数据将被永久删除」措辞，而不是普通成员退出的「数据仍归家庭所有」。
  const isLastMember = summary.memberCount <= 1;
  const leaveTitle = isLastMember
    ? "退出后将解散这个家庭"
    : "确认退出这个家庭吗？";
  const leaveDescription = isLastMember
    ? `你是「${summary.familyName}」的最后一名成员，退出后这个家庭会被解散，里面的所有植物、提醒和养护记录都会被永久删除，且无法恢复。`
    : `退出后你将离开「${summary.familyName}」，家庭里的养护数据仍由其他家人保留，需要重新被邀请才能回来。`;

  return (
    <section style={pageStyle}>
      <h1 style={pageTitleStyle}>设置</h1>

      <SettingsGroup title="个人">
        <section style={cardStyle}>
          <SettingCardHeader eyebrow="账号" icon="🙂" title="个人信息" />
          <AvatarUploadField
            displayName={myDisplayName}
            imageStorageId={currentMember?.imageStorageId ?? null}
          />
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
            onClick={() => setLeaveSheetOpen(true)}
            style={leaveFamilyButtonStyle}
            type="button"
          >
            退出家庭
          </button>
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

      {leaveSheetOpen ? (
        <ConfirmSheet
          ariaLabel="退出家庭确认"
          confirmLabel={
            isLeaving ? "退出中…" : isLastMember ? "退出并解散家庭" : "退出家庭"
          }
          description={leaveError ?? leaveDescription}
          isSubmitting={isLeaving}
          onCancel={closeLeaveSheet}
          onConfirm={() => void handleLeaveFamily()}
          title={leaveTitle}
          variant="danger-solid"
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

// 退出家庭为更强的破坏性操作：红实底 + 纸白字，视觉上区别于退出登录（红描边）。
const leaveFamilyButtonStyle: React.CSSProperties = {
  appearance: "none",
  width: "100%",
  minHeight: "44px",
  borderRadius: "var(--radius-button)",
  background: "var(--color-error)",
  border: "1px solid var(--color-error)",
  color: "var(--color-paper)",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};
