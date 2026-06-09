import { v } from "convex/values";
import { careTaskTypeValues } from "../../src/features/tasks/taskTypes";

export const familyRoleValues = ["admin", "member"] as const;
export const plantTaskTypeValues = careTaskTypeValues;

export const familyRoleValidator = v.union(
  ...familyRoleValues.map((role) => v.literal(role)),
);

export const plantTaskTypeValidator = v.union(
  ...plantTaskTypeValues.map((taskType) => v.literal(taskType)),
);

export const utcTimestampValidator = v.number();
export const optionalUtcTimestampValidator = v.optional(utcTimestampValidator);
export const optionalTrimmedTextValidator = v.optional(v.string());

export const userFields = {
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: optionalTrimmedTextValidator,
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  displayName: optionalTrimmedTextValidator,
  createdAt: utcTimestampValidator,
  updatedAt: utcTimestampValidator,
};

export const familyFields = {
  name: v.string(),
  inviteCode: v.string(),
  createdBy: v.id("users"),
  createdAt: utcTimestampValidator,
};

export const familyMemberFields = {
  familyId: v.id("families"),
  userId: v.id("users"),
  role: familyRoleValidator,
  joinedAt: utcTimestampValidator,
};

export const plantFields = {
  familyId: v.id("families"),
  name: v.string(),
  description: optionalTrimmedTextValidator,
  notes: optionalTrimmedTextValidator,
  location: optionalTrimmedTextValidator,
  imageStorageId: v.optional(v.id("_storage")),
  createdBy: v.id("users"),
  createdAt: utcTimestampValidator,
  updatedAt: utcTimestampValidator,
  isArchived: v.boolean(),
  archivedAt: optionalUtcTimestampValidator,
};

export const plantTaskFields = {
  plantId: v.id("plants"),
  familyId: v.id("families"),
  taskType: plantTaskTypeValidator,
  customLabel: optionalTrimmedTextValidator,
  intervalDays: v.number(),
  enabled: v.boolean(),
  lastCompletedAt: optionalUtcTimestampValidator,
  lastNotifiedAt: optionalUtcTimestampValidator,
  nextDueAt: utcTimestampValidator,
  createdBy: v.id("users"),
  createdAt: utcTimestampValidator,
  updatedAt: utcTimestampValidator,
};

export const taskCompletionLogFields = {
  taskId: v.id("plantTasks"),
  plantId: v.id("plants"),
  familyId: v.id("families"),
  completedBy: v.id("users"),
  completedAt: utcTimestampValidator,
  taskType: plantTaskTypeValidator,
  intervalDays: v.number(),
};

export const pushSubscriptionFields = {
  userId: v.id("users"),
  familyId: v.id("families"),
  endpoint: v.string(),
  p256dh: v.string(),
  auth: v.string(),
  deviceLabel: v.string(),
  userAgent: optionalTrimmedTextValidator,
  lastSeenAt: utcTimestampValidator,
  createdAt: utcTimestampValidator,
};
