import { useQuery } from "convex/react";
import { useState } from "react";

import { api } from "../../../convex/_generated/api";
import { navigate } from "../../app/router";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { DueTaskGroup } from "./DueTaskGroup";
import type { DueTaskCardData } from "./DueTaskCard";

interface TodoQueryResult {
  overdue: DueTaskCardData[];
  today: DueTaskCardData[];
  upcoming: DueTaskCardData[];
}

export function TodoPage() {
  const result = useQuery(api.tasks.listDueTasks, {}) as TodoQueryResult | undefined;
  const [completionHintTaskId, setCompletionHintTaskId] = useState<string | null>(null);

  if (result === undefined) {
    return (
      <section style={stateCardStyle}>
        <p style={eyebrowStyle}>Inbox</p>
        <h1 style={titleStyle}>Loading due tasks queue</h1>
        <p style={bodyStyle}>Pulling overdue, due-today, and upcoming reminders for this family.</p>
      </section>
    );
  }

  const totalTaskCount = result.overdue.length + result.today.length + result.upcoming.length;

  return (
    <section style={pageStyle}>
      <PageHeader
        eyebrow="Inbox"
        title="Due tasks queue"
        description={
          <p style={bodyStyle}>
            Start with the most urgent care work first. Overdue tasks lead, today stays visible,
            and the next three days remain ready before anyone forgets.
          </p>
        }
      />

      {completionHintTaskId ? (
        <section role="status" style={hintCardStyle}>
          <p style={hintTitleStyle}>Completion write path lands in the next reminder task.</p>
          <p style={hintBodyStyle}>
            This queue now groups work and exposes the row-level complete affordance. `CARE-006`
            will connect it to completion logs and next-due recomputation.
          </p>
        </section>
      ) : null}

      {totalTaskCount === 0 ? (
        <EmptyState
          actions={
            <Button fullWidth={false} onClick={() => navigate("/plants")} type="button">
              Browse plants
            </Button>
          }
          badge="Inbox"
          title="No due tasks in the next three days"
          description="Once a household reminder becomes overdue, due today, or due soon, it will surface here first."
          minHeight="220px"
        />
      ) : (
        <>
          <DueTaskGroup
            description="These reminders have already slipped past their planned day and should be handled first."
            eyebrow={`${result.overdue.length} due`}
            onComplete={(task) => setCompletionHintTaskId(task.taskId)}
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.overdue}
            title="Overdue"
          />
          <DueTaskGroup
            description="These routines land today, so the household can close them before the day ends."
            eyebrow={`${result.today.length} due`}
            onComplete={(task) => setCompletionHintTaskId(task.taskId)}
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.today}
            title="Due today"
          />
          <DueTaskGroup
            description="The next three days stay visible so everyone can batch care work before it becomes urgent."
            eyebrow={`${result.upcoming.length} queued`}
            onComplete={(task) => setCompletionHintTaskId(task.taskId)}
            onOpenPlant={(plantId) => navigate(`/plants/${plantId}`)}
            tasks={result.upcoming}
            title="Upcoming"
          />
        </>
      )}
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const stateCardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "28px 22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.24)",
  boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "12px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.75rem",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(2rem, 5vw, 3rem)",
  lineHeight: 1.02,
  fontWeight: 700,
  color: "#1e293b",
  letterSpacing: "-0.05em",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const hintCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "16px 18px",
  background: "linear-gradient(135deg, rgba(255,247,237,0.98), rgba(255,255,255,0.95))",
  border: "1px solid rgba(251,146,60,0.38)",
  display: "grid",
  gap: "6px",
};

const hintTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#9a3412",
  fontSize: "0.95rem",
  fontWeight: 700,
};

const hintBodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#7c2d12",
  fontSize: "0.88rem",
  lineHeight: 1.6,
};
