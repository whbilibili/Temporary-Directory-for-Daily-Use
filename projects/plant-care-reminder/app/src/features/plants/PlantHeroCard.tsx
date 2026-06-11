import { StorageImage } from "../../components/ui/StorageImage";
import { getUtcDayStart } from "../tasks/scheduling";

interface TaskSummaryInput {
  lastCompletedAt: number | null;
  nextDueAt: number;
}

interface PlantHeroCardProps {
  plant: {
    archivedAt: number | null;
    createdAt: number;
    description: string | null;
    imageStorageId?: string | null;
    imageUrl: string | null;
    isArchived: boolean;
    location: string | null;
    name: string;
    note: string | null;
    updatedAt: number;
  };
  tasks?: TaskSummaryInput[];
  onThumbnailClick?: () => void;
}

type StatusLevel = "overdue" | "today" | "normal" | "archived";

function computeStatusLevel(
  plant: { isArchived: boolean },
  tasks: TaskSummaryInput[],
): StatusLevel {
  if (plant.isArchived) return "archived";

  const now = Date.now();
  const startOfToday = getUtcDayStart(now);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const startOfTomorrow = startOfToday + MS_PER_DAY;

  let hasOverdue = false;
  let hasToday = false;

  for (const task of tasks) {
    // 跳过今日已完成的任务
    if (
      task.lastCompletedAt !== null &&
      task.lastCompletedAt >= startOfToday &&
      task.lastCompletedAt < startOfTomorrow
    ) {
      continue;
    }
    if (task.nextDueAt < startOfToday) {
      hasOverdue = true;
      break;
    }
    if (task.nextDueAt < startOfTomorrow) {
      hasToday = true;
    }
  }

  if (hasOverdue) return "overdue";
  if (hasToday) return "today";
  return "normal";
}

function getStatusText(level: StatusLevel, tasks: TaskSummaryInput[]): string {
  switch (level) {
    case "overdue":
      return "有逾期任务需处理";
    case "today":
      return "今天有任务待完成";
    case "archived":
      return "已归档";
    case "normal":
      return tasks.length > 0 ? "养护状态良好" : "暂无养护计划";
  }
}

function getStatusColor(level: StatusLevel): string {
  switch (level) {
    case "overdue":
      return "var(--color-warning)";
    case "today":
      return "var(--color-leaf-light)";
    case "archived":
    case "normal":
      return "var(--color-muted)";
  }
}

export function PlantHeroCard({ plant, tasks = [], onThumbnailClick }: PlantHeroCardProps) {
  const statusLevel = computeStatusLevel(plant, tasks);
  const statusText = getStatusText(statusLevel, tasks);
  const statusColor = getStatusColor(statusLevel);

  const hasImage = Boolean(plant.imageUrl || plant.imageStorageId);

  return (
    <article style={containerStyle}>
      {/* 缩略图 */}
      <div
        aria-label={hasImage ? "查看大图" : undefined}
        aria-hidden={!hasImage ? "true" : undefined}
        onClick={hasImage ? onThumbnailClick : undefined}
        onKeyDown={
          hasImage
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onThumbnailClick?.();
                }
              }
            : undefined
        }
        role={hasImage ? "button" : undefined}
        style={{
          ...thumbnailWrapStyle,
          cursor: hasImage ? "pointer" : "default",
        }}
        tabIndex={hasImage ? 0 : undefined}
      >
        <StorageImage
          alt={`${plant.name}缩略图`}
          initialUrl={plant.imageUrl}
          storageId={plant.imageStorageId as never}
          style={thumbnailImageStyle}
          fallback={
            <div style={thumbnailPlaceholderStyle}>
              <span aria-hidden="true" style={placeholderEmojiStyle}>
                🪴
              </span>
            </div>
          }
        />
      </div>

      {/* 文字区 */}
      <div style={textAreaStyle}>
        <h1 style={nameStyle}>{plant.name}</h1>
        <p style={subInfoStyle}>
          {plant.location?.trim() && (
            <>
              <span>{plant.location.trim()}</span>
              <span style={dotStyle}>·</span>
            </>
          )}
          <span style={{ color: statusColor }}>{statusText}</span>
        </p>
      </div>
    </article>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "var(--space-md)",
  padding: "var(--space-md)",
  background: "var(--color-surface)",
  borderRadius: "var(--radius-card)",
  border: "1px solid var(--color-line)",
};

const thumbnailWrapStyle: React.CSSProperties = {
  flexShrink: 0,
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid var(--color-line)",
};

const thumbnailImageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const thumbnailPlaceholderStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--color-mist)",
};

const placeholderEmojiStyle: React.CSSProperties = {
  fontSize: "24px",
  lineHeight: 1,
};

const textAreaStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "2px",
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: 1.2,
  color: "var(--color-ink)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const subInfoStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-body)",
  fontSize: "12px",
  fontWeight: 400,
  lineHeight: 1.4,
  color: "var(--color-muted)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const dotStyle: React.CSSProperties = {
  margin: "0 4px",
  color: "var(--color-muted)",
};
