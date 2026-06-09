import { StorageImage } from "../../components/ui/StorageImage";
import { Button } from "../../components/ui/Button";
import { formatDueDate, formatTaskTypeLabel } from "../../lib/formatters";

export interface PlantListCardData {
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
  const nextDueTitle = plant.nextDueTask
    ? formatTaskTypeLabel(plant.nextDueTask.taskType, plant.nextDueTask.customLabel)
    : "还没有养护任务";
  const nextDueCopy = plant.nextDueTask ? formatDueDate(plant.nextDueTask.nextDueAt) : null;

  return (
    <article style={cardStyle}>
      <div style={coverWrapStyle}>
        <StorageImage
          alt={`${plant.name}封面图`}
          initialUrl={plant.imageUrl}
          storageId={plant.imageStorageId as never}
          style={coverImageStyle}
          fallback={
            <div style={coverPlaceholderStyle}>
              <span aria-hidden="true" style={placeholderIconStyle}>
                🌿
              </span>
              <span style={placeholderTextStyle}>轻触上传照片</span>
            </div>
          }
        />
      </div>
      <div style={infoStyle}>
        <div style={copyStackStyle}>
          <h2 style={nameStyle}>{plant.name}</h2>
          {plant.location?.trim() ? (
            <p style={locationStyle}>{plant.location.trim()}</p>
          ) : null}
        </div>
        <div style={pillRowStyle}>
          <span style={carePillStyle}>{nextDueTitle}</span>
          {nextDueCopy ? <span style={dueCopyStyle}>{nextDueCopy}</span> : null}
        </div>
        <div style={actionsStyle}>
          <Button fullWidth={false} onClick={() => onOpen(plant.id)} type="button">
            查看详情
          </Button>
          <Button fullWidth={false} onClick={() => onEdit(plant.id)} type="button" variant="secondary">
            编辑
          </Button>
        </div>
      </div>
    </article>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  borderRadius: "var(--radius-card)",
  overflow: "hidden",
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  boxShadow: "var(--shadow-card)",
};

const coverWrapStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  aspectRatio: "16 / 10",
  overflow: "hidden",
  background: "var(--color-mist)",
};

const coverImageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const coverPlaceholderStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-sm)",
  background: "var(--color-mist)",
};

const placeholderIconStyle: React.CSSProperties = {
  fontSize: "48px",
  lineHeight: 1,
  color: "var(--color-line)",
  opacity: 0.7,
};

const placeholderTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--color-muted)",
};

const infoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-sm)",
  padding: "12px 16px",
};

const copyStackStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-xs)",
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: 1.2,
  color: "var(--color-ink)",
};

const locationStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 400,
  color: "var(--color-muted)",
};

const pillRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "var(--space-sm)",
};

const carePillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: "var(--radius-pill)",
  background: "var(--color-mist)",
  color: "var(--color-leaf-light)",
  fontSize: "12px",
  fontWeight: 700,
};

const dueCopyStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--color-muted)",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  flexWrap: "wrap",
  gap: "var(--space-sm)",
  marginTop: "var(--space-xs)",
};
