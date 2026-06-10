import type { CareTaskType } from "./taskTypes";

/**
 * 任务类型可视化映射：emoji + token 色双编码。
 * 色值一律引用 tokens.css 的 --color-task-* 变量，禁止行内 #hex。
 */
const taskTypeVisuals: Record<CareTaskType, { emoji: string; colorVar: string }> = {
  watering: { emoji: "💧", colorVar: "var(--color-task-watering)" },
  fertilizing: { emoji: "🌱", colorVar: "var(--color-task-fertilizing)" },
  misting: { emoji: "💨", colorVar: "var(--color-task-misting)" },
  repotting: { emoji: "🪴", colorVar: "var(--color-task-repotting)" },
  pruning: { emoji: "✂️", colorVar: "var(--color-task-pruning)" },
  custom: { emoji: "🏷️", colorVar: "var(--color-task-custom)" },
};

export function taskTypeColorVar(taskType: CareTaskType): string {
  return taskTypeVisuals[taskType].colorVar;
}

interface TaskTypeBadgeProps {
  taskType: CareTaskType;
}

/**
 * 缩略图右下角的类型小圆点角标，emoji + 类型色描边，
 * 让用户扫一眼即知任务类型，而非读文字。静态识别元素，无动效。
 */
export function TaskTypeBadge({ taskType }: TaskTypeBadgeProps) {
  const { emoji, colorVar } = taskTypeVisuals[taskType];

  return (
    <span
      aria-hidden="true"
      style={{
        ...badgeStyle,
        borderColor: colorVar,
        boxShadow: `0 0 0 1px ${colorVar}`,
      }}
    >
      {emoji}
    </span>
  );
}

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  right: "-2px",
  bottom: "-2px",
  width: "18px",
  height: "18px",
  borderRadius: "var(--radius-pill)",
  background: "var(--color-surface)",
  border: "1.5px solid",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "10px",
  lineHeight: 1,
};
