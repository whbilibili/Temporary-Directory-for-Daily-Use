import { useState } from "react";

import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import {
  clearCreateFamilySuccess,
  markCreateFamilySuccess,
} from "./createFamilySuccess";
import { CreateFamilyForm } from "./CreateFamilyForm";

interface CreateFamilyResult {
  familyId: string;
  inviteCode: string;
}

export function CreateFamilyPage() {
  const [createdFamily, setCreatedFamily] = useState<CreateFamilyResult | null>(null);

  function handleSuccess(result: CreateFamilyResult) {
    markCreateFamilySuccess();
    setCreatedFamily(result);
  }

  function goToPlantBoard() {
    clearCreateFamilySuccess();
    navigate("/plants");
  }

  if (createdFamily) {
    return (
      <section style={cardStyle}>
        <header style={headerStyle}>
          <p style={eyebrowStyle}>创建完成</p>
          <h1 style={titleStyle}>共享家庭已创建完成</h1>
          <p style={bodyStyle}>
            把这串邀请码发给家人，他们就能加入同一个植物看板。
          </p>
        </header>
        <div style={inviteCardStyle}>
          <p style={inviteLabelStyle}>邀请码</p>
          <p style={inviteCodeStyle}>{createdFamily.inviteCode}</p>
          <p style={inviteHintStyle}>
            先把邀请码保存好，家人加入时会用到。你已经是这个家庭的第一位管理员。
          </p>
        </div>
        <Button type="button" onClick={goToPlantBoard}>
          进入植物看板
        </Button>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <header style={headerStyle}>
        <p style={eyebrowStyle}>创建家庭</p>
        <h1 style={titleStyle}>创建共享家庭植物空间</h1>
        <p style={bodyStyle}>
          系统会自动生成邀请码，并默认将你设为第一位管理员。
        </p>
      </header>
      <CreateFamilyForm onSuccess={handleSuccess} />
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: "var(--radius-card)",
  padding: "var(--space-lg)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  boxShadow: "var(--shadow-card)",
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

const inviteCardStyle: React.CSSProperties = {
  borderRadius: "var(--radius-card)",
  padding: "var(--space-lg) var(--space-md)",
  background: "var(--color-mist)",
  border: "1px solid var(--color-line)",
  display: "grid",
  gap: "var(--space-sm)",
  textAlign: "center",
};

const inviteLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-leaf)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontWeight: 700,
  fontSize: "0.76rem",
};

const inviteCodeStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-mono)",
  color: "var(--color-leaf)",
  fontSize: "28px",
  lineHeight: 1.1,
  fontWeight: 700,
  letterSpacing: "0.12em",
};

const inviteHintStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-muted)",
  fontSize: "0.9rem",
  lineHeight: 1.6,
};
