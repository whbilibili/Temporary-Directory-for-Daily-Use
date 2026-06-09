import { useState } from "react";

import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
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
        <PageHeader
          eyebrow="创建完成"
          title="共享家庭已创建完成"
          description={
            <p style={bodyStyle}>
              把这串邀请码发给家人，他们就能加入同一个植物看板和养护任务列表。
            </p>
          }
        />
        <div style={inviteCardStyle}>
          <p style={inviteLabelStyle}>邀请码</p>
          <p style={inviteCodeStyle}>{createdFamily.inviteCode}</p>
          <p style={inviteHintStyle}>
            先把这串邀请码保存好，后续家人加入时会用到。你已经是当前家庭的第一位管理员。
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
      <PageHeader
        eyebrow="创建家庭"
        title="创建共享家庭植物空间"
        description={
          <p style={bodyStyle}>
            为家里创建一个共享植物空间。系统会自动生成邀请码，并默认将你设为第一位管理员。
          </p>
        }
      />
      <CreateFamilyForm onSuccess={handleSuccess} />
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "28px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "20px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const inviteCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px 18px",
  background:
    "linear-gradient(180deg, rgba(14,116,144,0.08), rgba(255,255,255,0.96) 44%, rgba(249,115,22,0.1))",
  border: "1px solid #bfdbfe",
  display: "grid",
  gap: "10px",
  textAlign: "center",
};

const inviteLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f766e",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontWeight: 700,
  fontSize: "0.76rem",
};

const inviteCodeStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "2rem",
  lineHeight: 1,
  fontWeight: 800,
  letterSpacing: "0.18em",
};

const inviteHintStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.92rem",
  lineHeight: 1.6,
};
