import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";

interface FamilyOnboardingChoicePageProps {
  displayName: string;
}

export function FamilyOnboardingChoicePage({
  displayName,
}: FamilyOnboardingChoicePageProps) {
  return (
    <section style={pageStyle}>
      <div style={accentBandStyle}>
        <span style={accentPillStyle}>家庭协作设置</span>
        <p style={accentCopyStyle}>
          全家共用一个植物看板，谁来浇水、修剪、查看下一项养护任务都更清楚。
        </p>
      </div>
      <div style={cardStyle}>
        <PageHeader
          eyebrow="首次设置"
          title={`欢迎你，${displayName}。`}
          description={
            <p style={bodyStyle}>
              选择进入家庭植物看板的方式。你可以为家里新建一个共享空间，也可以通过家人发来的邀请码加入已有家庭。
            </p>
          }
        />
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
  gap: "18px",
};

const accentBandStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "18px 18px 16px",
  background:
    "linear-gradient(135deg, rgba(14,116,144,0.96), rgba(37,99,235,0.92) 48%, rgba(249,115,22,0.92))",
  color: "#eff6ff",
  boxShadow: "0 22px 46px rgba(14,116,144,0.18)",
};

const accentPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: "28px",
  padding: "0 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.16)",
  color: "#f8fafc",
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const accentCopyStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: "0.98rem",
  lineHeight: 1.6,
  color: "rgba(239,246,255,0.94)",
};

const cardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "28px 22px",
  background: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(148,163,184,0.22)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "22px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const choiceGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
};

const choiceCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  border: "1px solid #dbeafe",
  background: "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(239,246,255,0.82))",
  padding: "18px",
  display: "grid",
  gap: "12px",
};

const choiceBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  width: "fit-content",
  alignItems: "center",
  minHeight: "26px",
  padding: "0 10px",
  borderRadius: "999px",
  background: "#e0f2fe",
  color: "#0f766e",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const choiceTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1.3rem",
  lineHeight: 1.2,
};

const choiceDescriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.95rem",
  lineHeight: 1.65,
};

const choiceButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "2px",
};
