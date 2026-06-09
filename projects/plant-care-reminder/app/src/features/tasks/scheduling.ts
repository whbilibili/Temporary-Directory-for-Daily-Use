const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function validateIntervalDays(intervalDays: number) {
  if (!Number.isInteger(intervalDays) || intervalDays < 1) {
    return "提醒间隔天数必须是大于 0 的整数。";
  }

  return null;
}

export function computeNextDueAt({
  intervalDays,
  baseCompletedAt,
  now = Date.now(),
}: {
  baseCompletedAt: number | null;
  intervalDays: number;
  now?: number;
}) {
  const validationError = validateIntervalDays(intervalDays);
  if (validationError) {
    throw new Error(validationError);
  }

  const baseTimestamp = baseCompletedAt ?? now;
  return baseTimestamp + intervalDays * MS_PER_DAY;
}
