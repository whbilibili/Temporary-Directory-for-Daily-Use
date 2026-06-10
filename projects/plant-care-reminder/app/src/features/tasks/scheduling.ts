const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const UPCOMING_WINDOW_DAYS = 3;

/** UTC 自然日起点（00:00:00.000），用于分桶的稳定边界。 */
export function getUtcDayStart(timestamp: number) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * 判断任务是否「今日已完成」：lastCompletedAt 落在今天的自然日窗口内。
 * 间隔=1 天的任务次日 lastCompletedAt 变为昨天，会返回 false，从而正常重现。
 */
export function computeCompletedToday(
  lastCompletedAt: number | null,
  startOfToday: number,
  startOfTomorrow: number,
) {
  return (
    lastCompletedAt !== null &&
    lastCompletedAt >= startOfToday &&
    lastCompletedAt < startOfTomorrow
  );
}

export interface DueBucketInput {
  lastCompletedAt: number | null;
  nextDueAt: number;
  taskId: string;
}

export interface DueBucketResult<T extends DueBucketInput> {
  overdue: Array<T & { completedToday: boolean }>;
  today: Array<T & { completedToday: boolean }>;
  upcoming: Array<T & { completedToday: boolean }>;
}

/**
 * 纯分桶函数：把待办任务分到 已逾期 / 今天到期 / 即将到期 三桶，
 * 并为每条任务标注 completedToday。主区（overdue + today）只放今日未完成的，
 * 今日已完成的任务会因其 nextDueAt 被推到未来而自然落入 upcoming 桶（灰态展示）。
 */
export function bucketDueTasks<T extends DueBucketInput>(
  tasks: T[],
  now: number = Date.now(),
): DueBucketResult<T> {
  const startOfToday = getUtcDayStart(now);
  const startOfTomorrow = startOfToday + MS_PER_DAY;
  const startOfUpcomingLimit = startOfTomorrow + UPCOMING_WINDOW_DAYS * MS_PER_DAY;

  const annotated = tasks.map((task) => ({
    ...task,
    completedToday: computeCompletedToday(task.lastCompletedAt, startOfToday, startOfTomorrow),
  }));

  return {
    overdue: annotated.filter((task) => task.nextDueAt < startOfToday),
    today: annotated.filter(
      (task) => task.nextDueAt >= startOfToday && task.nextDueAt < startOfTomorrow,
    ),
    upcoming: annotated.filter(
      (task) => task.nextDueAt >= startOfTomorrow && task.nextDueAt < startOfUpcomingLimit,
    ),
  };
}

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
