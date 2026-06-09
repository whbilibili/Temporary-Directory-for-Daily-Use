export const careTaskTypeValues = [
  "watering",
  "fertilizing",
  "misting",
  "repotting",
  "pruning",
  "custom",
] as const;

export type CareTaskType = (typeof careTaskTypeValues)[number];

export interface CareTaskTypeOption {
  description: string;
  label: string;
  value: CareTaskType;
}

const taskTypeLabels: Record<Exclude<CareTaskType, "custom">, string> = {
  watering: "浇水",
  fertilizing: "施肥",
  misting: "喷雾",
  repotting: "换盆",
  pruning: "修剪",
};

export const careTaskTypeOptions: CareTaskTypeOption[] = [
  {
    value: "watering",
    label: taskTypeLabels.watering,
    description: "适用于土培植物的周期性浇水提醒。",
  },
  {
    value: "fertilizing",
    label: taskTypeLabels.fertilizing,
    description: "适用于生长期的施肥提醒。",
  },
  {
    value: "misting",
    label: taskTypeLabels.misting,
    description: "适用于叶片或气生根的补湿提醒。",
  },
  {
    value: "repotting",
    label: taskTypeLabels.repotting,
    description: "适用于根系长满后的换盆提醒。",
  },
  {
    value: "pruning",
    label: taskTypeLabels.pruning,
    description: "适用于整形、清理和修剪枯枝。",
  },
  {
    value: "custom",
    label: "自定义任务",
    description: "可用于家庭自己的个性化养护动作。",
  },
];

export function requiresCustomTaskName(taskType: CareTaskType) {
  return taskType === "custom";
}

export function normalizeCustomTaskName(customTaskName: string | null | undefined) {
  const trimmed = customTaskName?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function validateCustomTaskName(
  taskType: CareTaskType,
  customTaskName: string | null | undefined,
) {
  if (!requiresCustomTaskName(taskType)) {
    return null;
  }

  return normalizeCustomTaskName(customTaskName)
    ? null
    : "请输入这个提醒的自定义任务名称。";
}

export function formatTaskTypeLabel(taskType: CareTaskType, customTaskName?: string | null) {
  if (requiresCustomTaskName(taskType)) {
    return normalizeCustomTaskName(customTaskName) ?? "自定义任务";
  }

  return taskTypeLabels[taskType];
}
