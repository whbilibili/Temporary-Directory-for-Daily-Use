import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUserContext as loadCurrentUserContext } from "./lib/auth";
import { plantTaskTypeValidator } from "./lib/validators";
import { computeNextDueAt, validateIntervalDays } from "../src/features/tasks/scheduling";
import {
  normalizeCustomTaskName,
  validateCustomTaskName,
} from "../src/features/tasks/taskTypes";

interface CurrentFamilyMemberContext {
  familyId: NonNullable<Awaited<ReturnType<typeof loadCurrentUserContext>>["familyId"]>;
  userId: NonNullable<Awaited<ReturnType<typeof loadCurrentUserContext>>["userId"]>;
}

async function requireCurrentFamilyMember(
  ctx: Parameters<typeof loadCurrentUserContext>[0],
): Promise<CurrentFamilyMemberContext> {
  const currentUserContext = await loadCurrentUserContext(ctx);

  if (!currentUserContext.userId) {
    throw new Error("You must be signed in to manage care tasks.");
  }

  if (!currentUserContext.familyId) {
    throw new Error("You must belong to a family to manage care tasks.");
  }

  return {
    familyId: currentUserContext.familyId,
    userId: currentUserContext.userId,
  };
}

export const getTaskCreationPlant = query({
  args: {
    plantId: v.id("plants"),
  },
  handler: async (ctx, args) => {
    const currentUserContext = await requireCurrentFamilyMember(ctx);
    const plant = await ctx.db.get(args.plantId);

    if (!plant || plant.familyId !== currentUserContext.familyId || plant.isArchived) {
      return null;
    }

    return {
      plantId: plant._id,
      plantName: plant.name,
      location: plant.location ?? null,
    };
  },
});

export const createPlantTask = mutation({
  args: {
    plantId: v.id("plants"),
    taskType: plantTaskTypeValidator,
    customTaskName: v.union(v.string(), v.null()),
    intervalDays: v.number(),
    baseCompletedAt: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const currentUserContext = await requireCurrentFamilyMember(ctx);
    const plant = await ctx.db.get(args.plantId);

    if (!plant || plant.familyId !== currentUserContext.familyId) {
      throw new Error("This plant does not belong to your current household.");
    }

    if (plant.isArchived) {
      throw new Error("Archived plants cannot receive new care tasks.");
    }

    const customTaskError = validateCustomTaskName(args.taskType, args.customTaskName);
    if (customTaskError) {
      throw new Error(customTaskError);
    }

    const intervalError = validateIntervalDays(args.intervalDays);
    if (intervalError) {
      throw new Error(intervalError);
    }

    const createdAt = Date.now();
    const taskId = await ctx.db.insert("plantTasks", {
      plantId: plant._id,
      familyId: plant.familyId,
      taskType: args.taskType,
      customLabel: normalizeCustomTaskName(args.customTaskName) ?? undefined,
      intervalDays: args.intervalDays,
      enabled: true,
      lastCompletedAt: args.baseCompletedAt ?? undefined,
      nextDueAt: computeNextDueAt({
        intervalDays: args.intervalDays,
        baseCompletedAt: args.baseCompletedAt,
        now: createdAt,
      }),
      createdBy: currentUserContext.userId,
      createdAt,
      updatedAt: createdAt,
    });

    return {
      taskId,
    };
  },
});
