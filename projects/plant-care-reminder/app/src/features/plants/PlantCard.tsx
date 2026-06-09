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
  const nextDueCopy = plant.nextDueTask
    ? formatDueDate(plant.nextDueTask.nextDueAt)
    : "添加一个养护提醒后，这里会显示下一次待办。";

  return (
    <article style={cardStyle}>
      <div style={mediaWrapStyle}>
        <StorageImage
          alt={`${plant.name}封面图`}
          initialUrl={plant.imageUrl}
          storageId={plant.imageStorageId as never}
          style={imageStyle}
          fallback={
            <div style={imageFallbackStyle}>
              <p style={fallbackEyebrowStyle}>植物照片</p>
              <p style={fallbackCopyStyle}>上传封面图后，家庭成员会更容易快速识别这盆植物。</p>
            </div>
          }
        />
      </div>
      <div style={contentStyle}>
        <div style={copyStackStyle}>
          <p style={eyebrowStyle}>{plant.location?.trim() || "共享植物"}</p>
          <h2 style={titleStyle}>{plant.name}</h2>
          {plant.description ? <p style={descriptionStyle}>{plant.description}</p> : null}
        </div>
        <div style={duePanelStyle}>
          <p style={dueLabelStyle}>下一次任务</p>
          <p style={dueTitleStyle}>{nextDueTitle}</p>
          <p style={dueCopyStyle}>{nextDueCopy}</p>
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
  display: "grid",
  gap: "16px",
  borderRadius: "24px",
  padding: "16px",
  background: "rgba(255,255,255,0.96)",
  border: "1px solid #d9e2ec",
  boxShadow: "0 20px 48px rgba(15,23,42,0.08)",
};

const mediaWrapStyle: React.CSSProperties = {
  borderRadius: "20px",
  overflow: "hidden",
  minHeight: "208px",
  background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(249,115,22,0.14))",
};

const imageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  minHeight: "208px",
  maxHeight: "240px",
  objectFit: "cover",
};

const imageFallbackStyle: React.CSSProperties = {
  minHeight: "208px",
  padding: "18px",
  display: "grid",
  alignContent: "end",
  gap: "8px",
};

const fallbackEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-leaf)",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.76rem",
  fontWeight: 700,
};

const fallbackCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "#334155",
  fontSize: "0.98rem",
  lineHeight: 1.6,
};

const contentStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
};

const copyStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--color-leaf)",
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontSize: "0.76rem",
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1.45rem",
  lineHeight: 1.1,
  letterSpacing: "-0.04em",
};

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.95rem",
  lineHeight: 1.6,
};

const duePanelStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "14px 16px",
  background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(248,250,252,0.96))",
  border: "1px solid rgba(147,197,253,0.5)",
  display: "grid",
  gap: "4px",
};

const dueLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontWeight: 700,
};

const dueTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "1rem",
  fontWeight: 700,
};

const dueCopyStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  flexWrap: "wrap",
  gap: "10px",
};
