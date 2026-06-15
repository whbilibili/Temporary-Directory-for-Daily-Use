import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import {
  clearPendingInviteCode,
  getPendingInviteCode,
} from "./usePendingInvite";

interface FamilyOnboardingChoicePageProps {
  displayName: string;
}

export function FamilyOnboardingChoicePage({
  displayName,
}: FamilyOnboardingChoicePageProps) {
  const joinFamilyByInviteCode = useMutation(api.families.joinFamilyByInviteCode);
  // 自动加入态：检测到暂存邀请码时进入「加入中」，跳过二选一页直接编排加入。
  const [autoJoinState, setAutoJoinState] = useState<
    "idle" | "joining" | "failed"
  >(() => (getPendingInviteCode() ? "joining" : "idle"));
  const [autoJoinError, setAutoJoinError] = useState<string | null>(null);
  // 防 StrictMode/重渲染重复触发：同一暂存码仅尝试一次自动加入。
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    const pendingCode = getPendingInviteCode();
    if (!pendingCode || hasAttemptedRef.current) {
      return;
    }
    hasAttemptedRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        await joinFamilyByInviteCode({ inviteCode: pendingCode });
        // 成功：清除暂存，RouteGate 会据新 familyId 放行；显式跳 /todo 更稳。
        clearPendingInviteCode();
        if (!cancelled) {
          navigate("/todo", true);
        }
      } catch (error) {
        // 失败（无效码/已失效/已在家庭等）：清除暂存避免反复失败，回落二选一页手动操作。
        clearPendingInviteCode();
        if (!cancelled) {
          setAutoJoinError(
            error instanceof Error
              ? error.message
              : "自动加入家庭失败，请手动输入邀请码重试。",
          );
          setAutoJoinState("failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [joinFamilyByInviteCode]);

  // 自动加入进行中：展示 botanical 基调的过渡态，跳过二选一页。
  if (autoJoinState === "joining") {
    return (
      <section style={pageStyle}>
        <header style={headerStyle}>
          <p style={eyebrowStyle}>正在加入</p>
          <h1 style={titleStyle}>正在接入家庭植物看板…</h1>
          <p style={bodyStyle}>
            正在用邀请链接里的邀请码把你加入家人的共享看板，请稍候。
          </p>
        </header>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <header style={headerStyle}>
        <p style={eyebrowStyle}>首次设置</p>
        <h1 style={titleStyle}>{`欢迎你，${displayName}。`}</h1>
        <p style={bodyStyle}>
          选择进入家庭植物看板的方式：新建一个共享空间，或用家人发来的邀请码加入。
        </p>
      </header>
      {autoJoinState === "failed" && autoJoinError ? (
        <p aria-live="polite" style={autoJoinErrorStyle}>
          {autoJoinError}
        </p>
      ) : null}
      <div style={choiceGridStyle}>
        <ChoiceCard
          badge="新建家庭"
          buttonLabel="创建家庭"
          description="创建新的共享家庭，系统会自动生成邀请码，并将你设为第一位管理员。"
          onClick={() => navigate("/onboarding/create-family")}
          title="创建一个家庭"
          variant="primary"
        />
        <ChoiceCard
          badge="输入邀请码"
          buttonLabel="加入家庭"
          description="输入现有家庭的邀请码后，你就能进入同一个植物看板和养护任务列表。"
          onClick={() => navigate("/onboarding/join-family")}
          title="加入已有家庭"
          variant="secondary"
        />
      </div>
    </section>
  );
}

interface ChoiceCardProps {
  badge: string;
  buttonLabel: string;
  description: string;
  onClick: () => void;
  title: string;
  variant: "primary" | "secondary";
}

function ChoiceCard({
  badge,
  buttonLabel,
  description,
  onClick,
  title,
  variant,
}: ChoiceCardProps) {
  return (
    <article style={choiceCardStyle}>
      <span style={choiceBadgeStyle}>{badge}</span>
      <h2 style={choiceTitleStyle}>{title}</h2>
      <p style={choiceDescriptionStyle}>{description}</p>
      <Button
        fullWidth={false}
        onClick={onClick}
        style={choiceButtonStyle}
        type="button"
        variant={variant}
      >
        {buttonLabel}
      </Button>
    </article>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-lg)",
};

const headerStyle: React.CSSProperties = {
  maxHeight: "120px",
  display: "grid",
  gap: "var(--space-sm)",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-leaf)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "0.75rem",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "1.5rem",
  lineHeight: 1.25,
  fontWeight: 700,
  color: "var(--color-ink)",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "0.95rem",
  lineHeight: 1.6,
};

const choiceGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-md)",
};

const autoJoinErrorStyle: React.CSSProperties = {
  margin: 0,
  padding: "var(--space-sm) var(--space-md)",
  borderRadius: "var(--radius-button)",
  background: "var(--color-mist)",
  color: "var(--color-error)",
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const choiceCardStyle: React.CSSProperties = {
  borderRadius: "var(--radius-card)",
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  boxShadow: "var(--shadow-card)",
  padding: "var(--space-lg)",
  display: "grid",
  gap: "var(--space-sm)",
};

const choiceBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  width: "fit-content",
  alignItems: "center",
  minHeight: "26px",
  padding: "0 10px",
  borderRadius: "var(--radius-pill)",
  background: "var(--color-mist)",
  color: "var(--color-leaf)",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const choiceTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  color: "var(--color-ink)",
  fontSize: "1.2rem",
  lineHeight: 1.25,
  fontWeight: 700,
};

const choiceDescriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "0.92rem",
  lineHeight: 1.6,
};

const choiceButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "var(--space-xs)",
};
