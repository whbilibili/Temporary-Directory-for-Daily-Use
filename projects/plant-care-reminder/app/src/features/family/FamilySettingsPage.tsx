import { useQuery } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { NotificationPromptCard } from "../notifications/NotificationPromptCard";
import { MembersList } from "./MembersList";

export function FamilySettingsPage() {
  const summary = useQuery(api.families.getFamilySettingsSummary, {});
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopyInviteCode() {
    if (!summary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summary.inviteCode);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  if (summary === undefined) {
    return (
      <section style={cardStyle}>
        <PageHeader
          eyebrow="Settings"
          title="Loading household details..."
          description={
            <p style={bodyStyle}>
              Pulling the latest invite code and member list for your shared family space.
            </p>
          }
        />
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <section style={heroCardStyle}>
        <PageHeader
          eyebrow="Settings"
          title={summary.familyName}
          description={
            <p style={bodyStyle}>
              {summary.memberCount} household member{summary.memberCount === 1 ? "" : "s"} are
              currently connected to this shared board.
            </p>
          }
        />
      </section>
      <section style={cardStyle}>
        <PageHeader
          eyebrow="Invite Code"
          title="Share this code with new members"
          description={
            <p style={bodyStyle}>
              Anyone in your household can use this code from the join flow to connect to the
              same plant board and care queue.
            </p>
          }
        />
        <div style={invitePanelStyle}>
          <p style={inviteCodeStyle}>{summary.inviteCode}</p>
          <Button fullWidth={false} onClick={handleCopyInviteCode} type="button" variant="secondary">
            {copyStatus === "copied" ? "Copied" : "Copy code"}
          </Button>
          {copyStatus === "failed" ? (
            <p style={copyFeedbackStyle}>Copy failed on this device. You can still share the code manually.</p>
          ) : null}
        </div>
      </section>
      <NotificationPromptCard />
      <section style={cardStyle}>
        <PageHeader
          eyebrow="Members"
          title="Household members"
          description={
            <p style={bodyStyle}>
              Everyone listed here can collaborate inside the same family space.
            </p>
          }
        />
        <MembersList members={summary.members} />
      </section>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const heroCardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "24px 22px",
  background:
    "linear-gradient(135deg, rgba(14,116,144,0.92), rgba(37,99,235,0.9) 52%, rgba(249,115,22,0.9))",
  color: "#f8fafc",
  boxShadow: "0 26px 58px rgba(14,116,144,0.18)",
};

const cardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "24px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "18px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const invitePanelStyle: React.CSSProperties = {
  borderRadius: "20px",
  border: "1px solid #bfdbfe",
  background: "linear-gradient(180deg, rgba(219,234,254,0.48), rgba(255,255,255,0.96))",
  padding: "18px",
  display: "grid",
  gap: "12px",
  justifyItems: "center",
  textAlign: "center",
};

const inviteCodeStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "2rem",
  lineHeight: 1,
  fontWeight: 800,
  letterSpacing: "0.18em",
};

const copyFeedbackStyle: React.CSSProperties = {
  margin: 0,
  color: "#b45309",
  fontSize: "0.88rem",
  lineHeight: 1.5,
};
