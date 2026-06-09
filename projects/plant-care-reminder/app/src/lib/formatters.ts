export { formatTaskTypeLabel } from "../features/tasks/taskTypes";

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function formatDueDate(
  dueAt: number | Date | null | undefined,
  nowInput: number | Date = Date.now(),
) {
  if (dueAt === null || dueAt === undefined) {
    return "No due date";
  }

  const dueDate = dueAt instanceof Date ? dueAt : new Date(dueAt);
  const now = nowInput instanceof Date ? nowInput : new Date(nowInput);
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayDelta = Math.floor(
    (Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()) -
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
      msPerDay,
  );

  if (dayDelta < 0) {
    return `Overdue by ${Math.abs(dayDelta)} day${Math.abs(dayDelta) === 1 ? "" : "s"}`;
  }

  if (dayDelta === 0) {
    return "Due today";
  }

  if (dayDelta === 1) {
    return "Due tomorrow";
  }

  if (dayDelta <= 6) {
    return `Due in ${dayDelta} days`;
  }

  return `Due ${longDateFormatter.format(dueDate)}`;
}
