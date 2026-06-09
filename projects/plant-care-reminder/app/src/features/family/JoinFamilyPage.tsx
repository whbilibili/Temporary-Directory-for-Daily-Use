import { useState } from "react";

import { PageHeader } from "../../components/ui/PageHeader";
import { JoinFamilyForm } from "./JoinFamilyForm";

export function JoinFamilyPage() {
  const [isWaitingForRedirect, setIsWaitingForRedirect] = useState(false);

  if (isWaitingForRedirect) {
    return (
      <section style={cardStyle}>
        <PageHeader
          eyebrow="正在加入"
          title="正在接入家庭植物看板..."
          description={
            <p style={bodyStyle}>
              邀请码已验证通过，正在同步家庭植物资料并带你进入共享看板。
            </p>
          }
        />
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <PageHeader
        eyebrow="加入家庭"
        title="加入已有家庭"
        description={
          <p style={bodyStyle}>
            输入家人发来的邀请码，即可加入同一个植物看板和养护任务列表。
          </p>
        }
      />
      <JoinFamilyForm onSuccess={() => setIsWaitingForRedirect(true)} />
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
