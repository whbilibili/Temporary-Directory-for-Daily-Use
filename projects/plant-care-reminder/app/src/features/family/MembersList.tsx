import type { FamilyRole } from "../../types/domain";

interface MemberSummary {
  displayName: string | null;
  email: string | null;
  id: string;
  isCurrentUser: boolean;
  joinedAt: number;
  role: FamilyRole;
  userId: string;
}

interface MembersListProps {
  members: MemberSummary[];
}

function formatRole(role: FamilyRole) {
  return role === "admin" ? "管理员" : "成员";
}

export function MembersList({ members }: MembersListProps) {
  return (
    <div style={listStyle}>
      {members.map((member) => {
        const label = member.displayName?.trim() || member.email || "家庭成员";

        return (
          <article key={member.id} style={memberCardStyle}>
            <div style={memberHeaderStyle}>
              <div style={memberIdentityStyle}>
                <h3 style={memberNameStyle}>
                  {label}
                  {member.isCurrentUser ? <span style={selfTagStyle}>我</span> : null}
                </h3>
                {member.email && member.email !== label ? (
                  <p style={memberMetaStyle}>{member.email}</p>
                ) : null}
              </div>
              <span style={roleBadgeStyle}>{formatRole(member.role)}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const memberCardStyle: React.CSSProperties = {
  borderRadius: "18px",
  border: "1px solid #dbeafe",
  background: "rgba(248,250,252,0.95)",
  padding: "16px",
};

const memberHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
};

const memberIdentityStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const memberNameStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1rem",
  lineHeight: 1.25,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
};

const selfTagStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: "22px",
  padding: "0 8px",
  borderRadius: "999px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const memberMetaStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.88rem",
  lineHeight: 1.5,
};

const roleBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: "26px",
  padding: "0 10px",
  borderRadius: "999px",
  background: "#ecfeff",
  color: "#0f766e",
  fontSize: "0.74rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};
