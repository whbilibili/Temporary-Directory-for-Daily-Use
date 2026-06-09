import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { TaskListItem } from "./TaskListItem";

interface TaskSectionProps {
  onAdd: () => void;
  onCompleted?: (result: { lastCompletedAt: number; nextDueAt: number; taskId: string }) => void;
  onEdit: (taskId: string) => void;
  plantName: string;
  tasks: Array<{
    customLabel: string | null;
    id: string;
    intervalDays: number;
    lastCompletedAt: number | null;
    nextDueAt: number;
    taskType: "watering" | "fertilizing" | "misting" | "repotting" | "pruning" | "custom";
  }>;
}

export function TaskSection({ onAdd, onCompleted, onEdit, plantName, tasks }: TaskSectionProps) {
  return (
    <section style={sectionCardStyle}>
      <PageHeader
        actions={
          <Button fullWidth={false} onClick={onAdd} type="button">
            Add routine
          </Button>
        }
        eyebrow="Care tasks"
        title="Enabled routines"
        description={
          <p style={bodyStyle}>
            Each routine on {plantName} stays visible here with direct edit and completion entry
            points, so the plant detail page remains the coordination surface for the household.
          </p>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          actions={
            <Button fullWidth={false} onClick={onAdd} type="button">
              Add routine
            </Button>
          }
          badge="Care tasks"
          title="No enabled care routines yet"
          description="Add watering, fertilizing, misting, pruning, or custom routines for this plant."
          minHeight="200px"
        />
      ) : (
        <div style={taskListStyle}>
          {tasks.map((task) => (
            <TaskListItem
              key={task.id}
              onCompleted={onCompleted}
              onEdit={() => onEdit(task.id)}
              task={task}
            />
          ))}
        </div>
      )}
    </section>
  );
}

const sectionCardStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "22px 18px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid #d9e2ec",
  boxShadow: "0 20px 48px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "18px",
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const taskListStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};
