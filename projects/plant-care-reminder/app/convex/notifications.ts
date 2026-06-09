import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";
import { getCurrentUserContext as loadCurrentUserContext } from "./lib/auth";
import { v } from "convex/values";

interface CurrentFamilyMemberContext {
  familyId: NonNullable<Awaited<ReturnType<typeof loadCurrentUserContext>>["familyId"]>;
  userId: NonNullable<Awaited<ReturnType<typeof loadCurrentUserContext>>["userId"]>;
}

const NOTIFICATION_WINDOW_MS = 60 * 60 * 1000;

export function shouldNotifyTask({
  enabled,
  lastNotifiedAt,
  nextDueAt,
  now,
}: {
  enabled: boolean;
  lastNotifiedAt: number | null | undefined;
  nextDueAt: number;
  now: number;
}) {
  if (!enabled) {
    return false;
  }

  if (nextDueAt > now + NOTIFICATION_WINDOW_MS) {
    return false;
  }

  if (lastNotifiedAt === null || lastNotifiedAt === undefined) {
    return true;
  }

  return now - lastNotifiedAt >= NOTIFICATION_WINDOW_MS;
}

async function requireCurrentFamilyMember(
  ctx: Parameters<typeof loadCurrentUserContext>[0],
): Promise<CurrentFamilyMemberContext> {
  const currentUserContext = await loadCurrentUserContext(ctx);

  if (!currentUserContext.userId) {
    throw new Error("You must be signed in to manage notification subscriptions.");
  }

  if (!currentUserContext.familyId) {
    throw new Error("You must belong to a family to manage notification subscriptions.");
  }

  return {
    familyId: currentUserContext.familyId,
    userId: currentUserContext.userId,
  };
}

export const savePushSubscription = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    deviceLabel: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserContext = await requireCurrentFamilyMember(ctx);
    const now = Date.now();

    const existingSubscription = (
      await ctx.db
        .query("pushSubscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", currentUserContext.userId))
        .collect()
    ).find(
      (subscription) =>
        subscription.familyId === currentUserContext.familyId && subscription.endpoint === args.endpoint,
    );

    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, {
        p256dh: args.p256dh,
        auth: args.auth,
        deviceLabel: args.deviceLabel,
        lastSeenAt: now,
      });

      return {
        ok: true as const,
      };
    }

    await ctx.db.insert("pushSubscriptions", {
      userId: currentUserContext.userId,
      familyId: currentUserContext.familyId,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      deviceLabel: args.deviceLabel,
      userAgent: undefined,
      lastSeenAt: now,
      createdAt: now,
    });

    return {
      ok: true as const,
    };
  },
});

export const listNotifiableDueTasks = internalQuery({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("plantTasks")
      .withIndex("by_nextDueAt")
      .filter((q) => q.lte(q.field("nextDueAt"), args.now + NOTIFICATION_WINDOW_MS))
      .collect();

    const eligibleTasks = tasks.filter((task) =>
      shouldNotifyTask({
        enabled: task.enabled,
        lastNotifiedAt: task.lastNotifiedAt ?? null,
        nextDueAt: task.nextDueAt,
        now: args.now,
      }),
    );

    const tasksWithFanout = await Promise.all(
      eligibleTasks.map(async (task) => {
        const [plant, subscriptions] = await Promise.all([
          ctx.db.get(task.plantId),
          ctx.db
            .query("pushSubscriptions")
            .withIndex("by_familyId", (q) => q.eq("familyId", task.familyId))
            .collect(),
        ]);

        if (!plant || plant.isArchived || subscriptions.length === 0) {
          return null;
        }

        return {
          taskId: task._id,
          familyId: task.familyId,
          plantId: plant._id,
          plantName: plant.name,
          taskType: task.taskType,
          nextDueAt: task.nextDueAt,
          subscriptions: subscriptions.map((subscription) => ({
            subscriptionId: subscription._id,
            userId: subscription.userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.p256dh,
            auth: subscription.auth,
            deviceLabel: subscription.deviceLabel,
          })),
        };
      }),
    );

    return {
      tasks: tasksWithFanout.filter((task): task is NonNullable<typeof task> => task !== null),
    };
  },
});

export const markTaskNotified = internalMutation({
  args: {
    taskId: v.id("plantTasks"),
    notifiedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new Error("This care task no longer exists.");
    }

    await ctx.db.patch(args.taskId, {
      lastNotifiedAt: args.notifiedAt,
      updatedAt: args.notifiedAt,
    });

    return {
      ok: true as const,
    };
  },
});

export const processDueTaskNotifications = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const result = await ctx.runQuery(internal.notifications.listNotifiableDueTasks, {
      now,
    });

    let notifiedTaskCount = 0;
    let recipientCount = 0;

    for (const task of result.tasks) {
      if (task.subscriptions.length === 0) {
        continue;
      }

      recipientCount += task.subscriptions.length;
      await ctx.runMutation(internal.notifications.markTaskNotified, {
        taskId: task.taskId,
        notifiedAt: now,
      });
      notifiedTaskCount += 1;
    }

    return {
      notifiedTaskCount,
      recipientCount,
    };
  },
});
