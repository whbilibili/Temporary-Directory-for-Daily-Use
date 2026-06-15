import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import type { RouteContext } from "../../app/router";
import { Button } from "../../components/ui/Button";

interface JoinLandingPageProps {
  inviteCode: string | null;
  routeContext: RouteContext | undefined;
}

/**
 * 邀请链接落地页 /join/:code（SET3-013）。
 * 公开可达，自身据登录态 / 家庭态做四种引导：
 *   1) 无效 / 缺失邀请码：友好兜底，不白屏。
 *   2) 未登录：botanical 基调引导去登录 / 注册（暂存编排由 SET3-012 接管）。
 *   3) 已登录但未加入家庭：引导带码加入。
 *   4) 已登录且已有家庭：D3 友好提示「同一时间只能属于一个家庭」，不重复加入。
 */
export function JoinLandingPage({ inviteCode, routeContext }: JoinLandingPageProps) {
  const trimmedCode = inviteCode?.trim() ?? "";
  const hasValidCode = trimmedCode.length > 0;

  const isAuthenticated = routeContext !== undefined && routeContext.userId !== null;
  const hasFamily = routeContext !== undefined && routeContext.familyId !== null;

  // 仅在「已登录且已有家庭」时才查询家庭名，用于 D3 提示；其余分支跳过查询。
  const familySummary = useQuery(
    api.families.getFamilySettingsSummary,
    isAuthenticated && hasFamily ? {} : "skip",
  );

  // 兜底：邀请码缺失或为空 —— 友好提示，不白屏。
  if (!hasValidCode) {
    return (
      <LandingShell
        body="这个邀请链接看起来不完整或已失效。请向家人确认后重新打开，或手动输入邀请码加入。"
        eyebrow="邀请链接"
        title="链接好像失效了"
      >
        <Button fullWidth onClick={() => navigate("/")} type="button" variant="secondary">
          返回首页
        </Button>
      </LandingShell>
    );
  }

  // 分支 4：已登录且已有家庭 —— D3 友好提示，不重复加入。
  if (isAuthenticated && hasFamily) {
    const familyName = familySummary?.familyName?.trim();
    const familyClause = familyName ? `「${familyName}」` : "当前家庭";
    return (
      <LandingShell
        body={`你已经在${familyClause}中啦。每位成员同一时间只能属于一个家庭，因此暂时无法用这个邀请码加入新的家庭。`}
        eyebrow="你已加入家庭"
        title="无需重复加入"
      >
        <Button fullWidth onClick={() => navigate("/todo")} type="button" variant="primary">
          回到我的植物看板
        </Button>
      </LandingShell>
    );
  }

  // 分支 3：已登录但未加入家庭 —— 引导带码加入。
  if (isAuthenticated && !hasFamily) {
    return (
      <LandingShell
        body="你收到了一个家庭邀请。点击下方按钮，用这串邀请码加入家人的共享植物看板。"
        eyebrow="家庭邀请"
        title="加入家人的植物看板"
      >
        <p style={codeChipStyle}>邀请码：{trimmedCode}</p>
        <Button
          fullWidth
          onClick={() => navigate("/onboarding/join-family")}
          type="button"
          variant="primary"
        >
          用邀请码加入
        </Button>
      </LandingShell>
    );
  }

  // 分支 2：未登录 —— botanical 基调引导去登录 / 注册。
  return (
    <LandingShell
      body="你收到了一个家庭邀请。先登录或注册，登录后即可加入家人的共享植物看板。"
      eyebrow="家庭邀请"
      title="登录后加入家庭"
    >
      <p style={codeChipStyle}>邀请码：{trimmedCode}</p>
      <Button fullWidth onClick={() => navigate("/login")} type="button" variant="primary">
        登录 / 注册
      </Button>
    </LandingShell>
  );
}

interface LandingShellProps {
  body: string;
  children: React.ReactNode;
  eyebrow: string;
  title: string;
}

function LandingShell({ body, children, eyebrow, title }: LandingShellProps) {
  return (
    <section style={pageStyle}>
      <article style={cardStyle}>
        <span style={iconStyle} aria-hidden>
          🌿
        </span>
        <p style={eyebrowStyle}>{eyebrow}</p>
        <h1 style={titleStyle}>{title}</h1>
        <p style={bodyStyle}>{body}</p>
        <div style={actionsStyle}>{children}</div>
      </article>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "var(--radius-card)",
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  boxShadow: "var(--shadow-card)",
  padding: "var(--space-lg)",
  display: "grid",
  gap: "var(--space-sm)",
};

const iconStyle: React.CSSProperties = {
  fontSize: "2rem",
  lineHeight: 1,
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

const codeChipStyle: React.CSSProperties = {
  margin: "var(--space-xs) 0 0",
  display: "inline-flex",
  width: "fit-content",
  alignItems: "center",
  minHeight: "32px",
  padding: "0 var(--space-sm)",
  borderRadius: "var(--radius-pill)",
  background: "var(--color-mist)",
  color: "var(--color-leaf)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.95rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const actionsStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-sm)",
  marginTop: "var(--space-sm)",
};
