import { useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { NotificationPromptCard } from "../notifications/NotificationPromptCard";
import { MembersList } from "./MembersList";
import { SettingCardHeader } from "./SettingCardHeader";
import { SettingsGroup } from "./SettingsGroup";

type CopyStatus = "idle" | "copied" | "failed" | "fallback_open";

export function FamilySettingsPage() {
  const { signOut } = useAuthActions();
  const summary = useQuery(api.families.getFamilySettingsSummary, {});
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopyInviteCode = useCallback(async () => {
    if (!summary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summary.inviteCode);
      setCopyStatus("copied");
      resetTimerRef.current = setTimeout(() => {
        setCopyStatus("idle");
        resetTimerRef.current = null;
      }, 1500);
    } catch {
      setCopyStatus("fallback_open");
    }
  }, [summary]);

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

  const copyButtonLabel =
    copyStatus === "copied" ? "已复制" : "复制邀请码";
  const copyButtonDynamicStyle: React.CSSProperties =
    copyStatus === "copied"
      ? { ...copyButtonStyle, background: "var(--color-success)", color: "var(--color-surface)" }
      : copyButtonStyle;

  const currentMember = summary.members.find((member) => member.isCurrentUser);
  const myDisplayName = currentMember?.displayName ?? "我";

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
        <section style={cardStyle}>
          <SettingCardHeader eyebrow="家庭摘要" icon="🏠" title={summary.familyName} />
          <p style={bodyStyle}>
            当前已有 {summary.memberCount} 位家人加入这个共享植物看板。
          </p>
        </section>

        <section style={cardStyle}>
          <SettingCardHeader eyebrow="邀请码与分享" icon="🔑" title="把这串邀请码发给家人" />
          <p style={bodyStyle}>
            家人在加入家庭时输入这串邀请码，就能进入同一个植物看板和提醒列表。
          </p>
          <p style={inviteCodeStyle}>{summary.inviteCode}</p>
          <Button
            onClick={() => void handleCopyInviteCode()}
            style={copyButtonDynamicStyle}
            type="button"
            variant="primary"
          >
            {copyButtonLabel}
          </Button>

          {copyStatus === "fallback_open" ? (
            <div style={fallbackPanelStyle} role="region" aria-label="手动复制邀请码">
              <p style={fallbackCodeStyle}>{summary.inviteCode}</p>
              <p style={fallbackHintStyle}>长按可复制</p>
              <p style={fallbackDescStyle}>你也可以直接把这串码发给家人</p>
            </div>
          ) : null}
        </section>

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

const inviteCodeStyle: React.CSSProperties = {
  margin: "var(--space-xs) 0",
  color: "var(--color-leaf)",
  fontFamily: "var(--font-mono)",
  fontSize: "28px",
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: "0.12em",
  textAlign: "center",
  userSelect: "all",
};

const copyButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "44px",
  borderRadius: "var(--radius-button)",
  fontSize: "14px",
  fontWeight: 600,
};

const fallbackPanelStyle: React.CSSProperties = {
  background: "var(--color-mist)",
  borderRadius: "var(--radius-input)",
  padding: "var(--space-md)",
  border: "1px dashed var(--color-line)",
  display: "grid",
  gap: "var(--space-xs)",
  textAlign: "center",
};

const fallbackCodeStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-leaf)",
  fontFamily: "var(--font-mono)",
  fontSize: "28px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  lineHeight: 1,
  userSelect: "all",
};

const fallbackHintStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "12px",
  lineHeight: 1.5,
};

const fallbackDescStyle: React.CSSProperties = {
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
