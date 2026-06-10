import { DueTaskCard, type DueTaskCardData } from "./DueTaskCard";
import { UpcomingDueCard } from "./UpcomingDueCard";
import type { CompletionUndoPayload } from "./UndoToast";

interface DueTaskGroupProps {
  onCompleted?: (undo: CompletionUndoPayload) => void;
  onOpenPlant: (plantId: string) => void;
  tasks: DueTaskCardData[];
  title: string;
}

export function DueTaskGroup({ onCompleted, onOpenPlant, tasks, title }: DueTaskGroupProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <section style={sectionStyle}>
      <h2 style={labelStyle}>
        {title}
        <span style={countStyle}>{tasks.length}</span>
      </h2>
      <div style={listStyle}>
        {tasks.map((task) =>
          task.completedToday ? (
            <UpcomingDueCard key={task.taskId} onOpenPlant={onOpenPlant} task={task} />
          ) : (
            <DueTaskCard
              key={task.taskId}
              onCompleted={onCompleted}
              onOpenPlant={onOpenPlant}
              task={task}
            />
          ),
        )}
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-sm)",
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "var(--space-sm)",
  color: "var(--color-leaf-light)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const countStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "18px",
  height: "18px",
  padding: "0 5px",
  borderRadius: "var(--radius-pill)",
  background: "var(--color-mist)",
  color: "var(--color-leaf)",
  fontSize: "11px",
  letterSpacing: 0,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "var(--space-sm)",
};
