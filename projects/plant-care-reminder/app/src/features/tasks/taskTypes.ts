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
  watering: "Watering",
  fertilizing: "Fertilizing",
  misting: "Misting",
  repotting: "Repotting",
  pruning: "Pruning",
};

export const careTaskTypeOptions: CareTaskTypeOption[] = [
  {
    value: "watering",
    label: taskTypeLabels.watering,
    description: "Recurring watering cadence for soil-based plants.",
  },
  {
    value: "fertilizing",
    label: taskTypeLabels.fertilizing,
    description: "Nutrient-feeding schedule for growth seasons.",
  },
  {
    value: "misting",
    label: taskTypeLabels.misting,
    description: "Humidity support for leaves and air roots.",
  },
  {
    value: "repotting",
    label: taskTypeLabels.repotting,
    description: "Larger interval maintenance for root-bound plants.",
  },
  {
    value: "pruning",
    label: taskTypeLabels.pruning,
    description: "Shape, cleanup, or dead-growth maintenance.",
  },
  {
    value: "custom",
    label: "Custom task",
    description: "Use a custom task name for household-specific rituals.",
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
    : "Enter a custom task name for this reminder.";
}

export function formatTaskTypeLabel(taskType: CareTaskType, customTaskName?: string | null) {
  if (requiresCustomTaskName(taskType)) {
    return normalizeCustomTaskName(customTaskName) ?? "Custom task";
  }

  return taskTypeLabels[taskType];
}
