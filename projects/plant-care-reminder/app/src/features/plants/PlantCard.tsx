import { useState } from "react";

import { StorageImage } from "../../components/ui/StorageImage";
import { formatDueDate, formatTaskTypeLabel } from "../../lib/formatters";

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

const taskTypeEmoji: Record<string, string> = {
  watering: "💧",
  fertilizing: "🧪",
  misting: "🌫️",
  repotting: "🪴",
  pruning: "✂️",
  custom: "📋",
};

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
  const emoji = plant.nextDueTask ? taskTypeEmoji[plant.nextDueTask.taskType] ?? "📋" : null;

  const resolvedCardStyle: React.CSSProperties = isOverdue
    ? { ...cardStyle, borderLeft: "3px solid var(--color-warning)", paddingLeft: "9px" }
    : cardStyle;

  return (
    <article style={resolvedCardStyle}>
      <div style={imageWrapStyle} onClick={() => onOpen(plant.id)}>
        <StorageImage
          alt={`${plant.name}封面图`}
          initialUrl={plant.imageUrl}
          storageId={plant.imageStorageId as never}
          style={imageStyle}
          fallback={
            <div style={imagePlaceholderStyle}>
              <span aria-hidden="true" style={placeholderIconStyle}>
                🌿
              </span>
            </div>
          }
        />
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
            ✏️
          </button>
        </div>
        {plant.location?.trim() ? (
          <p style={locationStyle}>{plant.location.trim()}</p>
        ) : null}
        <div style={statusLineStyle}>
          {nextDueTitle ? (
            <>
              <span style={carePillStyle}>
                {emoji ? <span aria-hidden="true">{emoji}</span> : null}
                {" "}{nextDueTitle}
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

const imageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const imagePlaceholderStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--color-mist)",
};

const placeholderIconStyle: React.CSSProperties = {
  fontSize: "32px",
  lineHeight: 1,
  opacity: 0.7,
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
};

const nameStyle: React.CSSProperties = {
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
