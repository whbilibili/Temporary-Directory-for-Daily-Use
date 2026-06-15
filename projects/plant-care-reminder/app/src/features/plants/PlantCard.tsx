import { useState } from "react";
import { Pencil } from "lucide-react";

import { Icon } from "../../components/ui/Icon";
import { formatDueDate, formatTaskTypeLabel } from "../../lib/formatters";
import { getTaskTypeIcon } from "../tasks/taskTypes";
import { taskTypeColorVar } from "../tasks/TaskTypeBadge";
import { PlantImage } from "./PlantImage";

export interface PlantListCardData {
  creationTime: number;
  description: string | null;
  id: string;
  imageStorageId: string | null;
  imageUrl: string | null;
  location: string | null;
  name: string;
  nextDueTask:
    | {
        customLabel: string | null;
        nextDueAt: number;
        taskType: "watering" | "fertilizing" | "misting" | "repotting" | "pruning" | "custom";
      }
    | null;
}

interface PlantCardProps {
  onOpen: (plantId: string) => void;
  onEdit: (plantId: string) => void;
  plant: PlantListCardData;
}

export function PlantCard({ onEdit, onOpen, plant }: PlantCardProps) {
  const [editPressed, setEditPressed] = useState(false);
  const isOverdue = plant.nextDueTask ? plant.nextDueTask.nextDueAt < Date.now() : false;
  const nextDueTitle = plant.nextDueTask
    ? formatTaskTypeLabel(plant.nextDueTask.taskType, plant.nextDueTask.customLabel)
    : null;
  const nextDueCopy = plant.nextDueTask ? formatDueDate(plant.nextDueTask.nextDueAt) : null;
  const nextDueTaskType = plant.nextDueTask?.taskType ?? null;

  const resolvedCardStyle: React.CSSProperties = isOverdue
    ? { ...cardStyle, borderLeft: "3px solid var(--color-warning)", paddingLeft: "9px" }
    : cardStyle;

  return (
    <article className="plant-card" style={resolvedCardStyle}>
      <div style={imageWrapStyle} onClick={() => onOpen(plant.id)}>
        <PlantImage alt={`${plant.name}封面图`} imageUrl={plant.imageUrl} />
      </div>
      <div style={textAreaStyle} onClick={() => onOpen(plant.id)}>
        <div style={nameRowStyle}>
          <h2 style={nameStyle}>{plant.name}</h2>
          <button
            aria-label="编辑"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(plant.id);
            }}
            onPointerDown={() => setEditPressed(true)}
            onPointerUp={() => setEditPressed(false)}
            onPointerLeave={() => setEditPressed(false)}
            style={{ ...editIconStyle, opacity: editPressed ? 1.0 : 0.4 }}
            type="button"
          >
            <Icon icon={Pencil} size={16} />
          </button>
        </div>
        {plant.location?.trim() ? (
          <p style={locationStyle}>{plant.location.trim()}</p>
        ) : null}
        <div style={statusLineStyle}>
          {nextDueTitle ? (
            <>
              <span style={carePillStyle}>
                {nextDueTaskType ? (
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      color: taskTypeColorVar(nextDueTaskType),
                    }}
                  >
                    <Icon icon={getTaskTypeIcon(nextDueTaskType)} size={13} />
                  </span>
                ) : null}
                {nextDueTitle}
              </span>
              {nextDueCopy ? (
                <span style={isOverdue ? overdueCopyStyle : dueCopyStyle}>{nextDueCopy}</span>
              ) : null}
            </>
          ) : (
            <span style={noCareStyle}>还没有养护任务</span>
          )}
        </div>
      </div>
      <button
        aria-label="查看详情"
        onClick={() => onOpen(plant.id)}
        style={detailButtonStyle}
        type="button"
      >
        ›
      </button>
    </article>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "12px",
  borderRadius: "var(--radius-card)",
  border: "1px solid var(--color-line)",
  background: "var(--color-surface)",
  minHeight: "104px",
  cursor: "pointer",
  gap: "16px",
};

const imageWrapStyle: React.CSSProperties = {
  flexShrink: 0,
  width: "80px",
  height: "80px",
  borderRadius: "12px",
  overflow: "hidden",
  background: "var(--color-mist)",
};


const textAreaStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "3px",
};

const nameRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-sm)",
  minWidth: 0,
};

const nameStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: 1.3,
  color: "var(--color-ink)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const editIconStyle: React.CSSProperties = {
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "44px",
  height: "44px",
  margin: "-14px -14px -14px 0",
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontSize: "16px",
  lineHeight: 1,
  color: "var(--color-muted)",
  transition: "opacity 100ms",
};

const locationStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  fontWeight: 400,
  color: "var(--color-muted)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const statusLineStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "var(--space-sm)",
  marginTop: "2px",
};

const carePillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "2px 8px",
  borderRadius: "var(--radius-pill)",
  background: "var(--color-mist)",
  color: "var(--color-leaf-light)",
  fontSize: "12px",
  fontWeight: 700,
};

const noCareStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--color-muted)",
  fontStyle: "italic",
};

const dueCopyStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--color-muted)",
};

const overdueCopyStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--color-warning)",
};

const detailButtonStyle: React.CSSProperties = {
  flexShrink: 0,
  background: "none",
  border: "none",
  padding: "0 4px",
  cursor: "pointer",
  fontSize: "24px",
  lineHeight: 1,
  color: "var(--color-muted)",
};

// --- Press feedback CSS injection (idempotent) ---
if (typeof document !== "undefined" && !document.getElementById("plant-card-press-css")) {
  const style = document.createElement("style");
  style.id = "plant-card-press-css";
  style.textContent = `
.plant-card {
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), background 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.plant-card:active {
  transform: scale(0.98);
  background: var(--color-mist);
  transition: transform 120ms ease-out, background 120ms ease-out;
}`;
  document.head.appendChild(style);
}
