import { formatDueDate, formatTaskTypeLabel } from "../../lib/formatters";
import { Button } from "../../components/ui/Button";
import { CompleteTaskButton } from "./CompleteTaskButton";

export interface DueTaskCardData {
  customLabel: string | null;
  intervalDays: number;
  lastCompletedAt: number | null;
  nextDueAt: number;
  plantId: string;
  plantImageUrl: string | null;
  plantName: string;
  taskId: string;
  taskType: "watering" | "fertilizing" | "misting" | "repotting" | "pruning" | "custom";
}

interface DueTaskCardProps {
  onOpenPlant: (plantId: string) => void;
  task: DueTaskCardData;
}

const detailDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function DueTaskCard({ onOpenPlant, task }: DueTaskCardProps) {
  const taskLabel = formatTaskTypeLabel(task.taskType, task.customLabel);
  const historyCopy = task.lastCompletedAt
    ? `Last completed ${detailDateFormatter.format(new Date(task.lastCompletedAt))}`
    : "No completion logged yet";

  return (
    <article style={cardStyle}>
      <div style={mediaWrapStyle}>
        {task.plantImageUrl ? (
          <img alt={`${task.plantName} cover`} src={task.plantImageUrl} style={imageStyle} />
        ) : (
          <div style={imageFallbackStyle}>
            <p style={fallbackEyebrowStyle}>Plant photo</p>
            <p style={fallbackCopyStyle}>Keep the plant image visible so family members spot the task fast.</p>
          </div>
        )}
      </div>
      <div style={contentStyle}>
        <div style={copyStackStyle}>
          <p style={plantEyebrowStyle}>Due now</p>
          <h2 style={titleStyle}>{taskLabel}</h2>
          <p style={plantNameStyle}>{task.plantName}</p>
          <p style={dueCopyStyle}>{formatDueDate(task.nextDueAt)}</p>
        </div>
        <div style={metaGridStyle}>
          <TaskMeta
            label="Cadence"
            value={`Every ${task.intervalDays} day${task.intervalDays === 1 ? "" : "s"}`}
          />
          <TaskMeta label="History" value={historyCopy} />
        </div>
      <div style={actionsStyle}>
          <CompleteTaskButton taskId={task.taskId} />
          <Button
            fullWidth={false}
            onClick={() => onOpenPlant(task.plantId)}
            type="button"
            variant="secondary"
          >
            Open plant
          </Button>
        </div>
      </div>
    </article>
  );
}

function TaskMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={metaTileStyle}>
      <p style={metaLabelStyle}>{label}</p>
      <p style={metaValueStyle}>{value}</p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
  borderRadius: "24px",
  padding: "16px",
  background: "rgba(255,255,255,0.96)",
  border: "1px solid #d9e2ec",
  boxShadow: "0 20px 48px rgba(15,23,42,0.08)",
};

const mediaWrapStyle: React.CSSProperties = {
  borderRadius: "20px",
  overflow: "hidden",
  minHeight: "172px",
  background: "linear-gradient(135deg, rgba(14,116,144,0.12), rgba(249,115,22,0.14))",
};

const imageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  minHeight: "172px",
  maxHeight: "208px",
  objectFit: "cover",
};

const imageFallbackStyle: React.CSSProperties = {
  minHeight: "172px",
  padding: "18px",
  display: "grid",
  alignContent: "end",
  gap: "8px",
};

const fallbackEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f766e",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.76rem",
  fontWeight: 700,
};

const fallbackCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "#334155",
  fontSize: "0.95rem",
  lineHeight: 1.6,
};

const contentStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
};

const copyStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "4px",
};

const plantEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#b45309",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.74rem",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1.45rem",
  lineHeight: 1.08,
  letterSpacing: "-0.04em",
};

const plantNameStyle: React.CSSProperties = {
  margin: 0,
  color: "#2563eb",
  fontSize: "1rem",
  fontWeight: 700,
};

const dueCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.95rem",
  lineHeight: 1.6,
};

const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
};

const metaTileStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "12px 14px",
  background: "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(219,234,254,0.52))",
  border: "1px solid rgba(191,219,254,0.86)",
  display: "grid",
  gap: "4px",
};

const metaLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const metaValueStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "0.92rem",
  lineHeight: 1.5,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};
