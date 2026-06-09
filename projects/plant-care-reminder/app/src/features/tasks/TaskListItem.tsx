import { formatDueDate, formatTaskTypeLabel } from "../../lib/formatters";
import { Button } from "../../components/ui/Button";
import { CompleteTaskButton } from "./CompleteTaskButton";

interface TaskListItemProps {
  onCompleted?: (result: { lastCompletedAt: number; nextDueAt: number; taskId: string }) => void;
  onEdit: () => void;
  task: {
    customLabel: string | null;
    id: string;
    intervalDays: number;
    lastCompletedAt: number | null;
    nextDueAt: number;
    taskType: "watering" | "fertilizing" | "misting" | "repotting" | "pruning" | "custom";
  };
}

const detailDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function TaskListItem({ onCompleted, onEdit, task }: TaskListItemProps) {
  const title = formatTaskTypeLabel(task.taskType, task.customLabel);
  const completionCopy = task.lastCompletedAt
    ? `Last completed ${detailDateFormatter.format(new Date(task.lastCompletedAt))}`
    : "No completion logged yet";

  return (
    <article style={taskCardStyle}>
      <div style={taskHeaderStyle}>
        <p style={taskEyebrowStyle}>Enabled routine</p>
        <h2 style={taskTitleStyle}>{title}</h2>
      </div>
      <div style={taskMetaGridStyle}>
        <TaskMeta label="Next due" value={formatDueDate(task.nextDueAt)} />
        <TaskMeta
          label="Cadence"
          value={`Every ${task.intervalDays} day${task.intervalDays === 1 ? "" : "s"}`}
        />
        <TaskMeta label="History" value={completionCopy} />
      </div>
      <div style={actionsStyle}>
        <Button fullWidth={false} onClick={onEdit} type="button" variant="secondary">
          Edit
        </Button>
        <CompleteTaskButton onCompleted={onCompleted} taskId={task.id} />
      </div>
    </article>
  );
}

function TaskMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={taskMetaTileStyle}>
      <p style={taskMetaLabelStyle}>{label}</p>
      <p style={taskMetaValueStyle}>{value}</p>
    </div>
  );
}

const taskCardStyle: React.CSSProperties = {
  borderRadius: "20px",
  padding: "16px",
  background: "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(219,234,254,0.5))",
  border: "1px solid rgba(147,197,253,0.45)",
  display: "grid",
  gap: "12px",
};

const taskHeaderStyle: React.CSSProperties = {
  display: "grid",
  gap: "4px",
};

const taskEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  fontWeight: 700,
};

const taskTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1.1rem",
  lineHeight: 1.2,
};

const taskMetaGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
};

const taskMetaTileStyle: React.CSSProperties = {
  borderRadius: "16px",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(191,219,254,0.86)",
  display: "grid",
  gap: "4px",
};

const taskMetaLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const taskMetaValueStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "0.94rem",
  lineHeight: 1.5,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};
