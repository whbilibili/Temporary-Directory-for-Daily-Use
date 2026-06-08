import { useState } from "react";

import { PageHeader } from "../../components/ui/PageHeader";
import { JoinFamilyForm } from "./JoinFamilyForm";

export function JoinFamilyPage() {
  const [isWaitingForRedirect, setIsWaitingForRedirect] = useState(false);

  if (isWaitingForRedirect) {
    return (
      <section style={cardStyle}>
        <PageHeader
          eyebrow="Joining Family"
          title="Linking you to the household board..."
          description={
            <p style={bodyStyle}>
              Your invite code was accepted. Hold on while we refresh your shared plants
              and route you into the family board.
            </p>
          }
        />
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <PageHeader
        eyebrow="Join Family"
        title="Join an existing household"
        description={
          <p style={bodyStyle}>
            Enter the invite code from another household member to join their shared plant
            board and care queue.
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
